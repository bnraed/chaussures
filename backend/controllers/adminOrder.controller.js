import Order from "../models/Order.js";

const STATUSES = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"];

const populateOrder = (q) =>
  q
    .populate("user", "email role")
    .populate("items.shoe", "name price images");

export const adminGetAllOrders = async (req, res, next) => {
  try {
    const orders = await populateOrder(
      Order.find().sort({ createdAt: -1 })
    );

    res.json(orders);
  } catch (e) {
    next(e);
  }
};

export const adminGetOrderById = async (req, res, next) => {
  try {
    const order = await populateOrder(Order.findById(req.params.id));

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    res.json(order);
  } catch (e) {
    next(e);
  }
};

export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    order.status = status;

    // Historique (si ton modèle l’a)
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      at: new Date(),
      by: req.user?._id,
    });

    await order.save();

    const updated = await populateOrder(Order.findById(order._id));
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const adminDeleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    await order.deleteOne();
    res.json({ message: "Commande supprimée" });
  } catch (e) {
    next(e);
  }
};
