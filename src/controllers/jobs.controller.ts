import { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { jobs } from "../db/schema.js";

export const createJob = async (req: Request, res: Response) => {
  if (!req.user) {
  return res.status(401).json({ error: "Unauthorized" });
}
  const userId = req.user?.id;
  const { company, role, description } = req.body;

  const [job] = await db
    .insert(jobs)
    .values({ userId, company, role, description })
    .returning();

  res.status(201).json(job);
};

export const getJobs = async (req: Request, res: Response) => {
   if (!req.user) {
  return res.status(401).json({ error: "Unauthorized" });
}
  const userId = req.user?.id;

  const data = await db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId));

  res.json(data);
};

export const getJobById = async (req: Request, res: Response) => {
   if (!req.user) {
  return res.status(401).json({ error: "Unauthorized" });
}
  const userId = req.user?.id;
  const { jobId } = req.params;

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (!job) return res.status(404).json({ error: "Job not found" });

  res.json(job);
};

export const updateJob = async (req: Request, res: Response) => {
   if (!req.user) {
  return res.status(401).json({ error: "Unauthorized" });
}
  const userId = req.user?.id;
  const { jobId } = req.params;

  const [job] = await db
    .update(jobs)
    .set(req.body)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .returning();

  if (!job) return res.status(404).json({ error: "Job not found" });

  res.json(job);
};

export const deleteJob = async (req: Request, res: Response) => {
   if (!req.user) {
  return res.status(401).json({ error: "Unauthorized" });
}
  const userId = req.user?.id;
  const { jobId } = req.params;

  const [job] = await db
    .delete(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .returning();

  if (!job) return res.status(404).json({ error: "Job not found" });

  res.json({ message: "Job deleted" });
};
