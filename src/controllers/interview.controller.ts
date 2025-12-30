import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, interviewQuestions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { generateInterviewQuestions } from "../services/ai.services.js";
import { redis } from "../lib/redis.js";

function parseQuestions(text: string) {
  const lines = text.split("\n");
  const result: { question: string; category: string }[] = [];
  let currentCategory = "general";

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.includes("HR")) currentCategory = "hr";
    else if (upper.includes("TECHNICAL")) currentCategory = "technical";
    else if (upper.includes("BEHAVIORAL")) currentCategory = "behavioral";

    const cleaned = line.replace(/^[-•\d.\sQ:]+/i, "").trim();

    // Reduced to 5 to avoid losing short questions
    if (cleaned.length > 5) {
      result.push({
        category: currentCategory,
        question: cleaned,
      });
    }
  }
  return result;
}

const interviewCacheKey = (userId: string, jobId: string) =>
  `interview:questions:${userId}:${jobId}`;

export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const cacheKey = interviewCacheKey(userId, jobId);

    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

    if (!job) return res.status(404).json({ error: "Job not found" });

    // AI Generation
    const rawText = await generateInterviewQuestions(job.description);
    const parsed = parseQuestions(rawText);

    if (parsed.length === 0) {
      return res.status(500).json({ error: "AI returned no valid questions" });
    }

    // INSERT without deleting existing ones
    await db.insert(interviewQuestions).values(
      parsed.map(q => ({
        userId,
        jobId,
        question: q.question,
        category: q.category,
      }))
    );

    // FETCH ALL (Old + New) to update frontend and cache
    const updatedList = await db
      .select()
      .from(interviewQuestions)
      .where(
        and(
          eq(interviewQuestions.jobId, jobId),
          eq(interviewQuestions.userId, userId)
        )
      );

    await redis.set(cacheKey, JSON.stringify(updatedList), {
      EX: 60 * 60 * 24,
    });

    return res.json(updatedList);
  } catch (err) {
    console.error("Generation failed:", err);
    return res.status(500).json({ error: "Failed to generate questions" });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const cacheKey = interviewCacheKey(userId, jobId);

    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const data = await db
      .select()
      .from(interviewQuestions)
      .where(
        and(
          eq(interviewQuestions.jobId, jobId),
          eq(interviewQuestions.userId, userId)
        )
      );

    await redis.set(cacheKey, JSON.stringify(data), { EX: 60 * 60 * 24 });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load questions" });
  }
};