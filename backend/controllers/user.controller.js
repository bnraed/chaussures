import User from "../models/User.js";

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("_id email role");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(user);
  } catch (e) {
    next(e);
  }
};
