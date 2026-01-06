import express from "express";
import { getAllShoes, getShoeById } from "../controllers/shoe.controller.js";
import protect from "../middleware/authMiddleware.js";
import { createReviewForShoe, getReviewsForShoe } from "../controllers/review.controller.js";

const router = express.Router();

// Public (site client)
router.get("/", getAllShoes);
router.get("/:id", getShoeById);
router.post("/:id/reviews", protect, createReviewForShoe);
router.get("/:id/reviews", getReviewsForShoe);

export default router;
