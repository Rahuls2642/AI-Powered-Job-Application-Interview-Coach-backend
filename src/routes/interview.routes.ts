import { Router } from "express";
import {
  generateQuestions,
  getQuestions,
} from "../controllers/interview.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/generate/:jobId", generateQuestions);
router.get("/:jobId", getQuestions);

export default router;
