import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    shoe: { type: mongoose.Schema.Types.ObjectId, ref: "Shoe", required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String }, // optionnel
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: { type: [orderItemSchema], required: true },

    total: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"],
      default: "CREATED",
    },

    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
