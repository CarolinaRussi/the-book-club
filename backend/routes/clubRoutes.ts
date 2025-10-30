import { Router } from "express";
import { getMyClubs } from "../controllers/clubControllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me/clubs", authMiddleware, getMyClubs);

export default router;
