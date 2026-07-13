import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  cancelMeeting,
  createMeeting,
  getMeetingsFromClub,
  getMyUpcomingMeetings,
  getPastMeetingsFromClub,
  resyncMeetingGoogleCalendar,
  updateMeeting,
} from "../controllers/meeting";
import {
  createMeetingRecap,
  deleteMeetingRecap,
  dismissMeetingRecapPrompt,
  getPendingMeetingRecap,
  updateMeetingRecap,
} from "../controllers/meetingRecap";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/me/upcoming-meetings", authMiddleware, getMyUpcomingMeetings);
router.get("/me/pending-meeting-recap", authMiddleware, getPendingMeetingRecap);
router.get("/club/:id/meetings", authMiddleware, getMeetingsFromClub);
router.get("/club/:id/meetings/past", authMiddleware, getPastMeetingsFromClub);
router.post("/create-meeting", authMiddleware, createMeeting);
router.put("/update-meeting/:id", authMiddleware, updateMeeting);
router.put("/cancel-meeting/:id", authMiddleware, cancelMeeting);
router.post(
  "/resync-meeting-google-calendar/:id",
  authMiddleware,
  resyncMeetingGoogleCalendar,
);
router.post(
  "/meetings/:id/recap",
  authMiddleware,
  upload.single("image"),
  createMeetingRecap,
);
router.put(
  "/meetings/:id/recap",
  authMiddleware,
  upload.single("image"),
  updateMeetingRecap,
);
router.delete("/meetings/:id/recap", authMiddleware, deleteMeetingRecap);
router.post(
  "/meetings/:id/recap/dismiss",
  authMiddleware,
  dismissMeetingRecapPrompt,
);

export default router;
