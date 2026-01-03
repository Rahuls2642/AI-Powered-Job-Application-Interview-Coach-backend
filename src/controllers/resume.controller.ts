import { Request, Response } from "express";
import { db } from "../db/index.js";
import { resumes } from "../db/schema.js";
import { atsAnalysis } from "../db/schema.js";


import { eq } from "drizzle-orm";

import  parsePdf from "../utils/pdfParse.js";

export const uploadResume = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const userId = req.user.id;

  const data = await parsePdf(req.file.buffer);
  const content = data.text.trim();

  if (content.length < 100) {
    return res.status(400).json({ error: "Resume content too short" });
  }

  const [saved] = await db
    .insert(resumes)
    .values({ userId, content })
    .returning();

  res.status(201).json({
    message: "Resume uploaded successfully",
    resumeId: saved.id,
  });
};
export const getATSByJob = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { jobId } = req.params;

  const [ats] = await db
    .select()
    .from(atsAnalysis)
    .where(eq(atsAnalysis.jobId, jobId));

  if (!ats) {
    return res.status(404).json({ error: "ATS not found" });
  }

  res.json(ats);
};

export const getResumes = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;

  const data = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(resumes.createdAt);

  res.json(data);
};
