import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/upload.middleware.js";
import {
  uploadResume,
  getResumes,
} from "../controllers/resume.controller.js";

const router = Router();

router.use(authMiddleware);

// PDF upload
router.post("/upload", upload.single("resume"), uploadResume);

// Get resume versions
router.get("/", getResumes);

export default router;
