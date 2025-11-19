import { Router } from "express";
import multer from "multer";
import {
  getUserAuthenticated,
  updateUser,
} from "../controllers/userControllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/me/user", authMiddleware, getUserAuthenticated);
router.put("/update-user", upload.single("profile_picture"), updateUser);

export default router;
