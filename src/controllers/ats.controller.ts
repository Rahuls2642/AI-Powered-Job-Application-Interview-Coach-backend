import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, atsAnalysis } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { analyzeResumeWithJD } from "../services/ai.services.js";

export const analyzeATS = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { jobId, resumeText } = req.body;

  if (!jobId || !resumeText) {
    return res.status(400).json({ error: "jobId and resumeText required" });
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const aiResult = await analyzeResumeWithJD(
    resumeText,
    job.description
  );

  const [saved] = await db
    .insert(atsAnalysis)
    .values({
      userId,
      jobId,
      matchScore: aiResult.matchScore,
      missingKeywords: aiResult.missingKeywords,
      suggestions: aiResult.suggestions,
    })
    .returning();

  res.json(saved);
};
