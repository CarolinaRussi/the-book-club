import { Router } from "express";
import { createClub, getClubByInvitationCode, getMyClubs, getUserClubs } from "../controllers/clubControllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me/clubs", authMiddleware, getMyClubs);
router.get("/invitation-code/:invitationCode", authMiddleware, getClubByInvitationCode);
router.post("/create-club", authMiddleware, createClub);
router.get("/user-clubs/:userId", authMiddleware, getUserClubs);

export default router;
