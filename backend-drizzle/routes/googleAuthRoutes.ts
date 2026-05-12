import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postGoogleOAuthStart,
  getGoogleOAuthCallback,
  getGoogleOAuthStatusHandler,
  deleteGoogleOAuth,
} from "../controllers/googleAuth";

const router = Router();

router.post("/auth/google/start", authMiddleware, postGoogleOAuthStart);
router.get("/auth/google/callback", getGoogleOAuthCallback);
router.get("/auth/google/status", authMiddleware, getGoogleOAuthStatusHandler);
router.delete("/auth/google", authMiddleware, deleteGoogleOAuth);

export default router;
