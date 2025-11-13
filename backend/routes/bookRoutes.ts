import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createBook, getBooksByClubId, saveReview } from "../controllers/bookControllers";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post(
  "/create-book",
  authMiddleware,
  upload.single("coverImg"),
  createBook
);
router.get("/club-books/:clubId", authMiddleware, getBooksByClubId);
router.post("/save-review", authMiddleware, saveReview);

export default router;
