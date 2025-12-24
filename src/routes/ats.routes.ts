import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js"
import { analyzeATS } from "../controllers/ats.controller.js";

const router = Router();

router.use(authMiddleware);
router.post("/analyze", analyzeATS);

export default router;
