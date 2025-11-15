import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createMeeting, getMeetingsFromClub } from "../controllers/meetingControllers";

const router = Router();

router.get(`/club/:id/meetings`, authMiddleware, getMeetingsFromClub);
router.post("/create-meeting", authMiddleware, createMeeting)

export default router;
