import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, atsAnalysis, answers } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";

/**
 * GET /reports/overview
 */
export const getOverviewReport = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    const [allJobs, ats, allAnswers] = await Promise.all([
      db.select().from(jobs).where(eq(jobs.userId, userId)),
      db.select().from(atsAnalysis).where(eq(atsAnalysis.userId, userId)),
      db.select().from(answers).where(eq(answers.userId, userId)),
    ]);

    const jobsByStatus = allJobs.reduce<Record<string, number>>(
      (acc, job) => {
        const status = job.status ?? "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

    const averageATSScore =
      ats.length === 0
        ? 0
        : Math.round(
            ats.reduce((sum, a) => sum + (a.matchScore ?? 0), 0) / ats.length
          );

    const averageInterviewScore =
      allAnswers.length === 0
        ? 0
        : Math.round(
            allAnswers.reduce((sum, a) => sum + (a.score ?? 0), 0) /
              allAnswers.length
          );

    res.json({
      totalJobs: allJobs.length,
      jobsByStatus,
      averageATSScore,
      averageInterviewScore,
      answersPracticed: allAnswers.length,
    });
  } catch (err) {
    console.error("Overview report error:", err);
    res.status(500).json({ error: "Failed to load overview report" });
  }
};

/**
 * GET /reports/ats-progress
 */
export const getATSProgress = async (req: Request, res: Response) => {
  try {
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
      .orderBy(asc(atsAnalysis.createdAt));

    res.json(data);
  } catch (err) {
    console.error("ATS progress error:", err);
    res.status(500).json({ error: "Failed to load ATS progress" });
  }
};

/**
 * GET /reports/weak-areas
 */
export const getWeakAreas = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    const ats = await db
      .select()
      .from(atsAnalysis)
      .where(eq(atsAnalysis.userId, userId));

    const keywordFrequency: Record<string, number> = {};

    for (const a of ats) {
      if (!a.missingKeywords || typeof a.missingKeywords !== "string") continue;

      for (const raw of a.missingKeywords.split(",")) {
        const key = raw.trim().toLowerCase();
        if (!key) continue;
        keywordFrequency[key] = (keywordFrequency[key] || 0) + 1;
      }
    }

    const result = Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    res.json(result);
  } catch (err) {
    console.error("Weak areas error:", err);
    res.status(500).json({ error: "Failed to load weak areas" });
  }
};
