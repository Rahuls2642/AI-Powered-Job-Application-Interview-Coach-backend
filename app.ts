import express from "express";
import cors from "cors";

import healthRoutes from './src/routes/health.routes';
import authRoutes from './src/routes/auth.routes';
import jobsRoutes from './src/routes/jobs.routes';
import resumeRoutes from './src/routes/resume.routes';
import atsRoutes from './src/routes/ats.routes';
import interviewRoutes from './src/routes/interview.routes';    
import answersRoutes from './src/routes/answer.routes';  
import reportsRoutes from './src/routes/report.routes';  

const app = express();

app.use(cors());
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
