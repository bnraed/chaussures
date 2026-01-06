import express from "express";
import protect, { isAdmin } from "../middleware/authMiddleware.js";

import {
  adminGetAllOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminDeleteOrder,
} from "../controllers/adminOrder.controller.js";

import {
  adminGetAllProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadProductImages,
} from "../controllers/adminProduct.controller.js";
import {
  adminGetAllReviews,
  adminDeleteReview,
} from "../controllers/adminReview.controller.js";

import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ---------------- UPLOAD CONFIG ----------------
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

// ---------------- ORDERS ----------------
router.get("/orders", protect, isAdmin, adminGetAllOrders);
router.get("/orders/:id", protect, isAdmin, adminGetOrderById);
router.put("/orders/:id/status", protect, isAdmin, adminUpdateOrderStatus);
router.delete("/orders/:id", protect, isAdmin, adminDeleteOrder);

// ---------------- PRODUCTS ----------------
router.get("/products", protect, isAdmin, adminGetAllProducts);
router.post("/products", protect, isAdmin, adminCreateProduct);
router.put("/products/:id", protect, isAdmin, adminUpdateProduct);
router.delete("/products/:id", protect, isAdmin, adminDeleteProduct);

// ---------------- REVIEWS ----------------
router.get("/reviews", protect, isAdmin, adminGetAllReviews);
router.delete("/reviews/:shoeId/:reviewId", protect, isAdmin, adminDeleteReview);

// upload
router.post(
  "/products/upload",
  protect,
  isAdmin,
  upload.array("images", 8),
  adminUploadProductImages
);

export default router;
