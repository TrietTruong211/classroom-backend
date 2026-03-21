import { NextFunction, Request, Response } from "express";
import aj from "../config/arcjet.js";
import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";

const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "development") return next()

  try {
    const role: RateLimitRole = req.user?.role || "guest";

    let limit: number;
    let message: string;

    switch (role) {
      case "admin":
        limit = 100; // High limit for admins
        message = "Admin rate limit exceeded. Please try again later.";
        break;
      case "teacher":
        limit = 20; // Moderate limit for teachers
        message = "Teacher rate limit exceeded. Please try again later.";
        break;
      case "student":
        limit = 10; // Low limit for students
        message = "Student rate limit exceeded. Please try again later.";
        break;
      default:
        limit = 5; // Very low limit for guests
        message = "Guest rate limit exceeded. Please try again later.";
    }

    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: '2s',
        max: limit,
      }
    ));

    const arcjetRequest: ArcjetNodeRequest = {
      method: req.method,
      url: req.originalUrl ?? req.url,
      headers: req.headers,
      socket: {remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0'}
    };

    const decision = await client.protect(arcjetRequest);

    // if (decision.isDenied() && decision.reason.isBot()) {
    //   return res.status(403).json({ error: 'Forbidden', message: 'Automated requests are not allowed' });
    // }

    if (decision.isDenied() && decision.reason.isShield()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Request blocked by security policy' });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return res.status(429).json({ error: 'Too many requests', message});
    }

    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    res.status(500).json({ message: "Something went wrong with security middleware" });
  }
}

export default securityMiddleware;