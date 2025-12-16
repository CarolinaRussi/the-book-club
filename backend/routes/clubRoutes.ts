import { Router } from "express";
import { createClub, getClubByInvitationCode, getMyClubs, getUserClubs, updateClub } from "../controllers/clubControllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me/clubs", authMiddleware, getMyClubs);
router.get("/invitation-code/:invitationCode", authMiddleware, getClubByInvitationCode);
router.post("/create-club", authMiddleware, createClub);
router.get("/user-clubs/:userId", authMiddleware, getUserClubs);
router.put("/update-club/:id", authMiddleware, updateClub);

export default router;
