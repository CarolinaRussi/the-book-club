import { Router } from "express";
import multer from "multer";
import {
  getUserAuthenticated,
  updateUser,
} from "../controllers/userControllers";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/me/user", getUserAuthenticated);
router.post("/update-user", upload.single("profile_picture"), updateUser);

export default router;
