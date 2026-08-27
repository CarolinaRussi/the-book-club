import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  cancelReadingDraw,
  castReadingDrawVotes,
  closeReadingDrawVote,
  completeReadingDraw,
  confirmReadingDrawNomination,
  createReadingDraw,
  eliminateReadingDraw,
  getActiveReadingDraw,
  getReadingDrawByShareCode,
  openReadingDrawVote,
  revealReadingDraw,
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
router.post("/reading-draws/:id/reveal", authMiddleware, revealReadingDraw);
router.post(
  "/reading-draws/:id/eliminate",
  authMiddleware,
  eliminateReadingDraw,
);
router.post(
  "/reading-draws/:id/open-vote",
  authMiddleware,
  openReadingDrawVote,
);
router.put("/reading-draws/:id/votes", authMiddleware, castReadingDrawVotes);
router.post(
  "/reading-draws/:id/close-vote",
  authMiddleware,
  closeReadingDrawVote,
);
router.post("/reading-draws/:id/cancel", authMiddleware, cancelReadingDraw);
router.post(
  "/reading-draws/:id/complete",
  authMiddleware,
  completeReadingDraw,
);

export default router;
