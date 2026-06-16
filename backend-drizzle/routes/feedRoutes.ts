import { Router } from "express";
import { getMyFeed } from "../controllers/feed";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me/feed", authMiddleware, getMyFeed);

export default router;
