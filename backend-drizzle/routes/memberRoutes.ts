import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  deleteMember,
  getMembersFromClub,
  joinClub,
  leaveClub,
} from "../controllers/member";

const router = Router();

router.get("/club/:id/members", authMiddleware, getMembersFromClub);
router.post("/join-club", authMiddleware, joinClub);
router.delete("/delete-member/:memberId", authMiddleware, deleteMember);
router.delete("/leave-club/:clubId", authMiddleware, leaveClub);

export default router;
