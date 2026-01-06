import Order from "../models/Order.js";
import Shoe from "../models/Shoe.js";

// =========================
// CREATE ORDER (USER)
// =========================
export const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error("Aucun article dans la commande");
    }

    let total = 0;

    for (const item of items) {
      const shoe = await Shoe.findById(item.shoe);
      if (!shoe) {
        res.status(404);
        throw new Error("Chaussure introuvable");
      }
      total += shoe.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      total,
      status: "CREATED",
      statusHistory: [{ status: "CREATED", by: req.user._id }],
    });

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
};

// =========================
// GET MY ORDERS (USER)
// =========================
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.shoe")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (e) {
    next(e);
  }
};

// =========================
// GET ORDER BY ID (USER)
// =========================
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email isAdmin")
      .populate("items.shoe");

    if (!order) {
      res.status(404);
      throw new Error("Commande introuvable");
    }

    // sécurité : user voit seulement ses commandes (admin voit tout)
    if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Accès non autorisé");
    }

    res.json(order);
  } catch (e) {
    next(e);
  }
};

// =========================
// ADMIN - GET ALL ORDERS
// =========================
export const adminGetAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email isAdmin")
      .populate("items.shoe")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (e) {
    next(e);
  }
};

// =========================
// ADMIN - UPDATE STATUS
// =========================
export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowed = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"];
    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error("Statut invalide");
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Commande introuvable");
    }

    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status, by: req.user._id });

    await order.save();

    res.json(order);
  } catch (e) {
    next(e);
  }
};
