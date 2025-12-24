import { Request, Response } from "express";

export const getCurrentUser = async (req: Request, res: Response) => {
  res.json({
    message: "Return current authenticated user",
  });
};
