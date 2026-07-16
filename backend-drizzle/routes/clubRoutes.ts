import { Router } from "express";
import {
  approveJoinRequest,
  createClub,
  createJoinRequest,
  deleteClub,
  discoverClubs,
  getClubByInvitationCode,
  getMyClubs,
  getPublicClubPreview,
  getUserClubs,
  joinPublicClub,
  listJoinRequests,
  rejectJoinRequest,
  updateClub,
} from "../controllers/club";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me/clubs", authMiddleware, getMyClubs);
router.get("/clubs/discover", authMiddleware, discoverClubs);
router.get("/clubs/:id/public", authMiddleware, getPublicClubPreview);
router.post("/clubs/:id/join", authMiddleware, joinPublicClub);
router.post("/clubs/:id/join-request", authMiddleware, createJoinRequest);
router.get("/clubs/:id/join-requests", authMiddleware, listJoinRequests);
router.post(
  "/clubs/join-requests/:requestId/approve",
  authMiddleware,
  approveJoinRequest,
);
router.post(
  "/clubs/join-requests/:requestId/reject",
  authMiddleware,
  rejectJoinRequest,
);
router.get("/invitation-code/:invitationCode", getClubByInvitationCode);
router.post("/create-club", authMiddleware, createClub);
router.get("/user-clubs/:userId", authMiddleware, getUserClubs);
router.put("/update-club/:id", authMiddleware, updateClub);
router.delete("/delete-club/:id", authMiddleware, deleteClub);

export default router;
