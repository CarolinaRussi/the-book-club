import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  createBook,
  getBooksByClubId,
  getBooksByTitleOrAuthor,
  //getBooksByUserId,
  saveReview,
} from "../controllers/bookControllers";
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
//router.get("/user-books/:userId", authMiddleware, getBooksByUserId);
router.get("/books/", authMiddleware, getBooksByTitleOrAuthor);
router.post("/save-review", authMiddleware, saveReview);

export default router;
