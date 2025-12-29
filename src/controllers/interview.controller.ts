import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, interviewQuestions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { generateInterviewQuestions } from "../services/ai.services.js";
import { redis } from "../lib/redis.js";



function parseQuestions(text: string) {
  const lines = text.split("\n");
  const result: { question: string; category: string }[] = [];

  let currentCategory = "";

  for (const line of lines) {
    if (line.toUpperCase().includes("HR")) currentCategory = "hr";
    else if (line.toUpperCase().includes("TECHNICAL"))
      currentCategory = "technical";
    else if (line.toUpperCase().includes("BEHAVIORAL"))
      currentCategory = "behavioral";
    else if (line.trim().startsWith("-")) {
      result.push({
        category: currentCategory || "general",
        question: line.replace("-", "").trim(),
      });
    }
  }

  return result;
}

const interviewCacheKey = (userId: string, jobId: string) =>
  `interview:questions:${userId}:${jobId}`;



export const generateQuestions = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { jobId } = req.params;
  const cacheKey = interviewCacheKey(userId, jobId);


  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("⚡ Interview questions cache HIT");
      return res.json(JSON.parse(cached));
    }
  } catch {
    console.log("⚡ Interview questions cache MISS");
  }

  
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }


  const rawText = await generateInterviewQuestions(job.description);
  const parsed = parseQuestions(rawText);

  if (parsed.length === 0) {
    return res.status(500).json({ error: "Failed to generate questions" });
  }

  const saved = await db
    .insert(interviewQuestions)
    .values(
      parsed.map(q => ({
        userId,
        jobId,
        question: q.question,
        category: q.category,
      }))
    )
    .returning();


  try {
    await redis.set(cacheKey, JSON.stringify(saved), {
      EX: 60 * 60 * 24,
    });
  } catch {}

  res.json(saved);
};



export const getQuestions = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { jobId } = req.params;
  const cacheKey = interviewCacheKey(userId, jobId);

 
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("⚡ Interview questions cache HIT (read)");
      return res.json(JSON.parse(cached));
    }
  } catch {}

 
  const data = await db
    .select()
    .from(interviewQuestions)
    .where(
      and(
        eq(interviewQuestions.jobId, jobId),
        eq(interviewQuestions.userId, userId)
      )
    );


  try {
    await redis.set(cacheKey, JSON.stringify(data), {
      EX: 60 * 60 * 24,
    });
  } catch {}

  res.json(data);
};
