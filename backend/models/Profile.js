import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  firstName: String,
  lastName: String,
  address: String,
  phone: String,
  gender: { type: String, enum: ["Homme", "Femme"] },
});

export default mongoose.model("Profile", profileSchema);
