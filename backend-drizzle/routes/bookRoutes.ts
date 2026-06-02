import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  createBook,
  deleteBookFromClub,
  getBooksByClubId,
  getBooksByTitleOrAuthor,
  getBooksByUserId,
  saveReview,
  updateBookTotalChapters,
} from "../controllers/book";
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
router.get("/user-books/:userId", authMiddleware, getBooksByUserId);
router.get("/books/", authMiddleware, getBooksByTitleOrAuthor);
router.post("/save-review", authMiddleware, saveReview);
router.patch(
  "/club-books/:clubId/:bookId/total-chapters",
  authMiddleware,
  updateBookTotalChapters
);
router.delete("/club-books/:clubId/:bookId", authMiddleware, deleteBookFromClub);

export default router;
