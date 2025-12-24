import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobs.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createJob);
router.get("/", getJobs);
router.get("/:jobId", getJobById);
router.patch("/:jobId", updateJob);
router.delete("/:jobId", deleteJob);

export default router;
