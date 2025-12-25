import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  submitAnswer,
  getAnswersByQuestion,
} from "../controllers/answers.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", submitAnswer);
router.get("/question/:questionId", getAnswersByQuestion);

export default router;
