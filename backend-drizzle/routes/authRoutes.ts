import { Router } from "express";
import { login, register, forgotPassword, resetPassword } from "../controllers/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

export default router;
