import { Request, Response } from "express";

export const saveResume = async (req: Request, res: Response) => {
  res.status(201).json({
    message: "Resume saved",
  });
};

export const getResumes = async (_: Request, res: Response) => {
  res.json({
    message: "Get all resume versions",
  });
};
