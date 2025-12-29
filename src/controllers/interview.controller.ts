import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, interviewQuestions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { generateInterviewQuestions } from "../services/ai.services.js";
import { redis } from "../lib/redis.js";

/* ---------------- Utilities ---------------- */

function parseQuestions(text: string) {
  const lines = text.split("\n");
  const result: { question: string; category: string }[] = [];

  let currentCategory = "general";

  for (const line of lines) {
    const upper = line.toUpperCase();

    if (upper.includes("HR")) currentCategory = "hr";
    else if (upper.includes("TECHNICAL")) currentCategory = "technical";
    else if (upper.includes("BEHAVIORAL")) currentCategory = "behavioral";

    // handle -, •, 1., Q1:
    const cleaned = line.replace(/^[-•\d.\sQ:]+/i, "").trim();

    if (cleaned.length > 10) {
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

/* ---------------- Controllers ---------------- */

/**
 * POST /interviews/generate/:jobId
 * Always regenerates interview questions
 */
export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const cacheKey = interviewCacheKey(userId, jobId);

    // 1️⃣ Verify job ownership
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // 2️⃣ Clear old questions + cache (CRITICAL FIX)
    await db
      .delete(interviewQuestions)
      .where(
        and(
          eq(interviewQuestions.jobId, jobId),
          eq(interviewQuestions.userId, userId)
        )
      );

    await redis.del(cacheKey);

    // 3️⃣ Generate fresh questions
    const rawText = await generateInterviewQuestions(job.description);
    const parsed = parseQuestions(rawText);

    if (parsed.length === 0) {
      return res
        .status(500)
        .json({ error: "AI returned no valid questions" });
    }

    // 4️⃣ Save to DB
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

    // 5️⃣ Cache result for reads
    await redis.set(cacheKey, JSON.stringify(saved), {
      EX: 60 * 60 * 24,
    });

    return res.json(saved);
  } catch (err) {
    console.error("Interview generation failed:", err);
    return res.status(500).json({ error: "Failed to generate questions" });
  }
};

/**
 * GET /interviews/:jobId
 * Fast read using Redis
 */
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const cacheKey = interviewCacheKey(userId, jobId);

    // 1️⃣ Redis read
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // 2️⃣ DB read
    const data = await db
      .select()
      .from(interviewQuestions)
      .where(
        and(
          eq(interviewQuestions.jobId, jobId),
          eq(interviewQuestions.userId, userId)
        )
      );

    // 3️⃣ Cache for next time
    await redis.set(cacheKey, JSON.stringify(data), {
      EX: 60 * 60 * 24,
    });

    return res.json(data);
  } catch (err) {
    console.error("Fetch interview questions failed:", err);
    return res.status(500).json({ error: "Failed to load questions" });
  }
};
