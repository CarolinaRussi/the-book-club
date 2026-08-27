import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  createReadingDraw,
  getActiveReadingDraw,
  getReadingDrawByShareCode,
} from "../controllers/readingDraw";

const router = Router();

router.post(
  "/clubs/:clubId/reading-draws",
  authMiddleware,
  createReadingDraw,
);
router.get(
  "/clubs/:clubId/reading-draws/active",
  authMiddleware,
  getActiveReadingDraw,
);
router.get(
  "/reading-draws/by-code/:shareCode",
  authMiddleware,
  getReadingDrawByShareCode,
);

export default router;
