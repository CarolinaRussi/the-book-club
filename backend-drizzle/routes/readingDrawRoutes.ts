import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  confirmReadingDrawNomination,
  createReadingDraw,
  getActiveReadingDraw,
  getReadingDrawByShareCode,
  unconfirmReadingDrawNomination,
  upsertReadingDrawNomination,
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
router.patch(
  "/reading-draws/:id/nomination",
  authMiddleware,
  upsertReadingDrawNomination,
);
router.post(
  "/reading-draws/:id/nomination/confirm",
  authMiddleware,
  confirmReadingDrawNomination,
);
router.post(
  "/reading-draws/:id/nomination/unconfirm",
  authMiddleware,
  unconfirmReadingDrawNomination,
);

export default router;
