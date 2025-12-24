import { Request, Response } from "express";

export const getOverviewReport = async (_: Request, res: Response) => {
  res.json({
    message: "Overall progress report",
  });
};

export const getSkillReport = async (_: Request, res: Response) => {
  res.json({
    message: "Skill gap report",
  });
};
