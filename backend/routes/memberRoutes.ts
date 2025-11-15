import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getMembersFromClub, joinClub } from "../controllers/memberControllers";

const router = Router();

router.get(`/club/:id/members`, authMiddleware, getMembersFromClub);
router.post(`/join-club`, authMiddleware, joinClub);

export default router;
