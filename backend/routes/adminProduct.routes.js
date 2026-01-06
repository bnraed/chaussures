import express from "express";
import protect, { isAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  adminGetAllProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadImages,
} from "../controllers/adminProduct.controller.js";

const router = express.Router();

// Upload images (multiple)
router.post("/upload", protect, isAdmin, upload.array("images", 6), adminUploadImages);

// CRUD
router.get("/", protect, isAdmin, adminGetAllProducts);
router.post("/", protect, isAdmin, adminCreateProduct);
router.put("/:id", protect, isAdmin, adminUpdateProduct);
router.delete("/:id", protect, isAdmin, adminDeleteProduct);

export default router;
