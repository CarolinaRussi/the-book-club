import { Router } from "express";
import { createFeedback } from "../controllers/feedback";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/feedback", authMiddleware, createFeedback);

export default router;
