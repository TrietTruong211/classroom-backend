try {
  const AgentAPI = await import("apminsight");
  AgentAPI.default.config();
} catch (e) {
  console.warn("apminsight failed to load, skipping APM:", (e as Error).message);
}

import "dotenv/config";
import express from "express";
import subjectsRouter from "./routes/subjects.js";
import cors from "cors";
import securityMiddleware from "./middleware/security.js";
import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth.js";

const app = express();
const PORT = process.env.PORT || 8000;

if (!process.env.FRONTEND_URL) {
  console.warn("WARNING: FRONTEND_URL is not set in environment variables");
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}))

app.all('/api/auth/*splat', toNodeHandler(auth)); // Express v5 uses *splat instead of *

app.use(express.json())
app.use(securityMiddleware)

app.use("/api/subjects", subjectsRouter)

app.get("/", (req, res) => {
  res.send("Hello, World!");
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "not set"}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL ? "set" : "MISSING"}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "set" : "MISSING"}`);
  console.log(`BETTER_AUTH_SECRET: ${process.env.BETTER_AUTH_SECRET ? "set" : "MISSING"}`);
  console.log(`ARCJET_KEY: ${process.env.ARCJET_KEY ? "set" : "MISSING"}`);
});
