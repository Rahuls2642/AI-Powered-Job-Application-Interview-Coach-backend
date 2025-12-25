import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, atsAnalysis, answers } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getOverviewReport = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;

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

  const jobStatusCount = allJobs.reduce<Record<string, number>>((acc, job) => {
    acc[job.status ?? "unknown"] = (acc[job.status ?? "unknown"] || 0) + 1;
    return acc;
  }, {});

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

  res.json({
    totalJobs: allJobs.length,
    jobsByStatus: jobStatusCount,
    averageATSScore: avgATS,
    averageInterviewScore: avgInterviewScore,
    answersPracticed: allAnswers.length,
  });
};

//ATS progress
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

//WEAK Areas
export const getWeakAreas = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;

  const ats = await db
    .select()
    .from(atsAnalysis)
    .where(eq(atsAnalysis.userId, userId));

  const keywordFrequency: Record<string, number> = {};

  ats.forEach(a => {
    if (!a.missingKeywords) return;
    a.missingKeywords.split(",").forEach(k => {
      const key = k.trim().toLowerCase();
      keywordFrequency[key] = (keywordFrequency[key] || 0) + 1;
    });
  });

  const sorted = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  res.json(sorted);
};
