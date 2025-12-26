import { Request, Response } from "express";
import { db } from "../db/index.js";
import { jobs, interviewQuestions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { generateInterviewQuestions } from "../services/ai.services.js";

function parseQuestions(text: string) {
  const lines = text.split("\n");
  const result: { question: string; category: string }[] = [];

  let currentCategory = "";

  for (const line of lines) {
    if (line.includes("HR")) currentCategory = "hr";
    else if (line.includes("TECHNICAL")) currentCategory = "technical";
    else if (line.includes("BEHAVIORAL")) currentCategory = "behavioral";
    else if (line.trim().startsWith("-")) {
      result.push({
        category: currentCategory,
        question: line.replace("-", "").trim(),
      });
    }
  }

  return result;
}

export const generateQuestions = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { jobId } = req.params;

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const rawText = await generateInterviewQuestions(job.description);
  const parsed = parseQuestions(rawText);
  

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

  res.json(saved);
};

export const getQuestions = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { jobId } = req.params;

  const data = await db
    .select()
    .from(interviewQuestions)
    .where(and(eq(interviewQuestions.jobId, jobId), eq(interviewQuestions.userId, userId)));

  res.json(data);
};
