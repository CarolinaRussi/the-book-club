import { Router } from "express";
import { createClub, getMyClubs } from "../controllers/clubControllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me/clubs", authMiddleware, getMyClubs);
router.post("/create-club", authMiddleware, createClub)

export default router;
