import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, atsAnalysis, answers } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { redis } from "../lib/redis.js";


const overviewKey = (userId: string) => `report:overview:${userId}`;
const weakAreasKey = (userId: string) => `report:weak-areas:${userId}`;


export const getOverviewReport = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const cacheKey = overviewKey(userId);

    // 🟡 Redis is OPTIONAL
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log("⚡ overview cache HIT");
          return res.json(JSON.parse(cached));
        }
      } catch (e) {
        console.warn("Redis read failed, continuing without cache");
      }
    }

    // 🟢 DB logic (authoritative source)
    const allJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.userId, userId));

    const ats = await db
      .select()
      .from(atsAnalysis)
      .where(eq(atsAnalysis.userId, userId));

    const allAnswers = await db
      .select()
      .from(answers)
      .where(eq(answers.userId, userId));

    const jobStatusCount = allJobs.reduce<Record<string, number>>(
      (acc, job) => {
        const status = job.status ?? "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

    const avgATS =
      ats.length === 0
        ? 0
        : Math.round(
            ats.reduce((sum, a) => sum + (a.matchScore ?? 0), 0) / ats.length
          );

    const avgInterviewScore =
      allAnswers.length === 0
        ? 0
        : Math.round(
            allAnswers.reduce((sum, a) => sum + a.score, 0) /
              allAnswers.length
          );

    const result = {
      totalJobs: allJobs.length,
      jobsByStatus: jobStatusCount,
      averageATSScore: avgATS,
      averageInterviewScore: avgInterviewScore,
      answersPracticed: allAnswers.length,
    };

    // 🟡 Cache write — best effort only
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(result), { EX: 60 });
      } catch {
        console.warn("Redis write failed");
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Overview report error:", err);
    res.status(500).json({ error: "Failed to load overview report" });
  }
};


export const getATSProgress = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;

  const data = await db
    .select({
      score: atsAnalysis.matchScore,
      createdAt: atsAnalysis.createdAt,
    })
    .from(atsAnalysis)
    .where(eq(atsAnalysis.userId, userId))
    .orderBy(atsAnalysis.createdAt);

  res.json(data);
};


export const getWeakAreas = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;
  const cacheKey = weakAreasKey(userId);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("⚡ weak areas cache HIT");
      return res.json(JSON.parse(cached));
    }
  } catch {}

  const ats = await db
    .select()
    .from(atsAnalysis)
    .where(eq(atsAnalysis.userId, userId));

  const keywordFrequency: Record<string, number> = {};

  ats.forEach(a => {
    if (!a.missingKeywords) return;
    a.missingKeywords.split(",").forEach(k => {
      const key = k.trim().toLowerCase();
      if (!key) return;
      keywordFrequency[key] = (keywordFrequency[key] || 0) + 1;
    });
  });

  const result = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  
  try {
    await redis.set(cacheKey, JSON.stringify(result), {
      EX: 300, 
    });
  } catch {}

  res.json(result);
};
