import { Router } from "express";
import {
  createClub,
  deleteClub,
  discoverClubs,
  getClubByInvitationCode,
  getMyClubs,
  getPublicClubPreview,
  getUserClubs,
  updateClub,
} from "../controllers/club";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me/clubs", authMiddleware, getMyClubs);
router.get("/clubs/discover", authMiddleware, discoverClubs);
router.get("/clubs/:id/public", authMiddleware, getPublicClubPreview);
router.get("/invitation-code/:invitationCode", getClubByInvitationCode);
router.post("/create-club", authMiddleware, createClub);
router.get("/user-clubs/:userId", authMiddleware, getUserClubs);
router.put("/update-club/:id", authMiddleware, updateClub);
router.delete("/delete-club/:id", authMiddleware, deleteClub);

export default router;
