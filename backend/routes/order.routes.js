import express from "express";
import protect, { isAdmin } from "../middleware/authMiddleware.js";
import { createOrder, getMyOrders } from "../controllers/order.controller.js";
import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  adminGetOrderById,
} from "../controllers/adminOrder.controller.js";

const router = express.Router();

/* CLIENT */
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

/* ADMIN */
router.get("/", protect, isAdmin, adminGetAllOrders);
router.get("/:id", protect, isAdmin, adminGetOrderById);
router.put("/:id/status", protect, isAdmin, adminUpdateOrderStatus);
router.delete("/:id", protect, isAdmin, adminDeleteOrder);

export default router;
