import { Router } from "express";

const router = Router();

// overall progress report
router.get("/overview", (req, res) => {
  res.json({ message: "Progress overview" });
});

// skill gaps report
router.get("/skills", (req, res) => {
  res.json({ message: "Skill gap report" });
});

export default router;
