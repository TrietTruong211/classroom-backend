try {
  const AgentAPI = await import("apminsight");
  AgentAPI.default.config();
} catch (e) {
  console.warn("apminsight failed to load, skipping APM:", (e as Error).message);
}

import "dotenv/config";
import express from "express";
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";
import departmentsRouter from "./routes/departments.js";
import statsRouter from "./routes/stats.js";
import enrollmentsRouter from "./routes/enrollments.js";
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
app.use("/api/users", usersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/enrollments", enrollmentsRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
