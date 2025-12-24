import { Router } from "express";
import { saveResume, getResumes } from "../controllers/resume.controller.js";

const router = Router();

router.post("/", saveResume);
router.get("/", getResumes);

export default router;
