import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, resumes, atsAnalysis } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { analyzeResumeWithJD } from "../services/ai.services.js";
import { redis } from "../lib/redis.js";

const atsCacheKey = (userId: string, jobId: string, resumeId: string) =>
  `ats:analysis:${userId}:${jobId}:${resumeId}`;

export const analyzeATS = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;
  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId));

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const [resume] = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.createdAt))
    .limit(1);

  if (!resume) {
    return res.status(400).json({ error: "No resume uploaded" });
  }

  const cacheKey = atsCacheKey(userId, jobId, resume.id);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("⚡ ATS cache HIT");
      return res.json(JSON.parse(cached));
    }
  } catch {
    console.log("⚡ ATS cache MISS");
  }

  const result = await analyzeResumeWithJD(
    resume.content,
    job.description
  );

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

  const response = {
    matchScore: saved.matchScore,
    missingKeywords: saved.missingKeywords,
    suggestions: saved.suggestions,
  };

  try {
    await redis.set(cacheKey, JSON.stringify(response), {
      EX: 60 * 60 * 24, // 24 hours
    });
  } catch {}

  res.json(response);
};
