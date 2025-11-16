import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  createMeeting,
  getMeetingsFromClub,
  updateMeeting,
} from "../controllers/meetingControllers";

const router = Router();

router.get(`/club/:id/meetings`, authMiddleware, getMeetingsFromClub);
router.post("/create-meeting", authMiddleware, createMeeting);
router.put("/update-meeting/:id", authMiddleware, updateMeeting);

export default router;
