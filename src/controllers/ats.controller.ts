import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, resumes, atsAnalysis } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { analyzeResumeWithJD } from "../services/ai.services.js";

export const analyzeATS = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;
  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }

  // 1️⃣ Get job
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId));

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  // 2️⃣ Get latest resume
  const [resume] = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.createdAt))
    .limit(1);

  if (!resume) {
    return res
      .status(400)
      .json({ error: "No resume uploaded" });
  }

  // 3️⃣ Run AI
  const result = await analyzeResumeWithJD(
    resume.content,
    job.description
  );

  // 4️⃣ Save ATS result
  const [saved] = await db
    .insert(atsAnalysis)
    .values({
      userId,
      jobId,
      matchScore: result.matchScore,
      missingKeywords: Array.isArray(result.missingKeywords)
        ? result.missingKeywords.join(", ")
        : result.missingKeywords,
      suggestions: result.suggestions,
    })
    .returning();

  // 5️⃣ Return result
  res.json({
    matchScore: saved.matchScore,
    missingKeywords: saved.missingKeywords,
    suggestions: saved.suggestions,
  });
};
