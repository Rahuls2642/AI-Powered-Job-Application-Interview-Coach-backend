import { Router } from "express";
import {
  generateQuestions,
  getQuestions,
} from "../controllers/interview.controller.js";

const router = Router();

router.post("/generate/:jobId", generateQuestions);
router.get("/:jobId", getQuestions);

export default router;
