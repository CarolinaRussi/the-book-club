import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getMemberFromClub } from "../controllers/memberControllers";

const router = Router();

router.get(`/club/:id/readers`, authMiddleware, getMemberFromClub);

export default router;