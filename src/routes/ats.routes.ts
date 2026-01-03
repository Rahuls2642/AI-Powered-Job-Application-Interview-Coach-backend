import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js"
import { analyzeATS } from "../controllers/ats.controller.js";
import { getATSByJob } from "../controllers/resume.controller.js";

const router = Router();

router.use(authMiddleware);
router.post("/analyze", analyzeATS);
router.get("/:jobId", getATSByJob);

export default router;
