import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getOverviewReport, getWeakAreas } from "../controllers/reports.controller.js";
import { getATSProgress } from "../controllers/reports.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/overview", getOverviewReport);
router.get("/ats-progress", getATSProgress);
router.get("/weak-areas", getWeakAreas);


export default router;
