import { Request, Response } from "express";
import { db } from "../db/index.js";
import { resumes } from "../db/schema.js";

// 👇 Add the missing import for 'eq'
import { eq } from "drizzle-orm";

// 👇 import CommonJS helper
import parsePdf from "../utils/pdfParse.cjs";

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