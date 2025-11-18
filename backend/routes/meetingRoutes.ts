import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  cancelMeeting,
  createMeeting,
  getMeetingsFromClub,
  getPastMeetingsFromClub,
  updateMeeting,
} from "../controllers/meetingControllers";

const router = Router();

router.get(`/club/:id/meetings`, authMiddleware, getMeetingsFromClub);
router.get(`/club/:id/meetings/past`, authMiddleware, getPastMeetingsFromClub);
router.post("/create-meeting", authMiddleware, createMeeting);
router.put("/update-meeting/:id", authMiddleware, updateMeeting);
router.put("/cancel-meeting/:id", authMiddleware, cancelMeeting);

export default router;
