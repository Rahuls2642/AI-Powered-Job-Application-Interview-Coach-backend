import express from "express";
import cors from "cors";

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import atsRoutes from './routes/ats.routes.js';
import interviewRoutes from './routes/interview.routes.js';    
import answersRoutes from './routes/answer.routes.js';  
import reportsRoutes from './routes/report.routes.js';  


const app = express();
app.use(cors())
app.use(cors({
    origin:"https://interview-master-frontend.onrender.com",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/jobs", jobsRoutes);
app.use("/resumes", resumeRoutes);
app.use("/ats", atsRoutes);
app.use("/interviews", interviewRoutes);
app.use("/answers", answersRoutes);
app.use("/reports", reportsRoutes);
export default app;
