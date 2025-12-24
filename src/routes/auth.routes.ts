import { Router } from "express";
import { getCurrentUser } from "../controllers/auth.controller.js";

const router = Router();

router.get("/me", getCurrentUser);

export default router;
