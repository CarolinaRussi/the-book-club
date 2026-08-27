import { Router } from "express";
import multer from "multer";
import {
  getUserAuthenticated,
  updateUser,
  getUserProfile,
  getUserReadings,
} from "../controllers/user";
import { authMiddleware } from "../middlewares/authMiddleware";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/me/user", authMiddleware, getUserAuthenticated);
router.put(
  "/update-user",
  authMiddleware,
  upload.single("profile_picture"),
  updateUser
);
router.get("/users/:userId/profile", authMiddleware, getUserProfile);
router.get("/users/:userId/readings", authMiddleware, getUserReadings);

export default router;
