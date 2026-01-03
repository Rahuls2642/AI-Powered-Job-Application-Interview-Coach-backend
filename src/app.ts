import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware/auth.middleware.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import atsRoutes from "./routes/ats.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import answersRoutes from "./routes/answer.routes.js";
import reportsRoutes from "./routes/report.routes.js";

const app = express();


app.set("trust proxy", 1);


app.use(
  cors({
    origin: [
      "https://interview-master-frontend.onrender.com",
      "http://localhost:5173",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);


app.options("/*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);


app.use("/jobs", authMiddleware, jobsRoutes);
app.use("/resumes", authMiddleware, resumeRoutes);
app.use("/ats", authMiddleware, atsRoutes);
app.use("/interviews", authMiddleware, interviewRoutes);
app.use("/answers", authMiddleware, answersRoutes);
app.use("/reports", authMiddleware, reportsRoutes);

export default app;
