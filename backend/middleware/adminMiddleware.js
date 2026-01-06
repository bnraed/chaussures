import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";

    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Non autorisé (token manquant)" });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Non autorisé (utilisateur introuvable)" });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Non autorisé (token invalide)" });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès admin requis" });
  }
  next();
};

export default protect;
