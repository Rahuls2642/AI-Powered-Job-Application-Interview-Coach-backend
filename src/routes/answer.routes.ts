import { Router } from "express";

const router = Router();

// submit answer
router.post("/", (req, res) => {
  res.json({ message: "Submit answer" });
});

// get answers for a question
router.get("/question/:questionId", (req, res) => {
  res.json({ message: "Get answers" });
});

export default router;
