import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createBook } from "../controllers/bookControllers";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post(
  "/create-book",
  authMiddleware,
  upload.single("coverImg"),
  createBook
);

export default router;
