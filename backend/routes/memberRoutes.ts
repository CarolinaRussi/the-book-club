import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getMemberFromClub, joinClub } from "../controllers/memberControllers";

const router = Router();

router.get(`/club/:id/readers`, authMiddleware, getMemberFromClub);
router.post(`/join-club`, authMiddleware, joinClub);

export default router;
