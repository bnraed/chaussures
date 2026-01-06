import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import protect, { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// public
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// admin
router.post("/", protect, isAdmin, createCategory);
router.put("/:id", protect, isAdmin, updateCategory);
router.delete("/:id", protect, isAdmin, deleteCategory);

export default router;
