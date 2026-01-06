import express from "express";
import {
  createReview,
  getReviewsByShoe,
} from "../controllers/review.controller.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/shoe/:shoeId", getReviewsByShoe);

export default router;
