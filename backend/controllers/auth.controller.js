import User from "../models/User.js";
import Profile from "../models/Profile.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409);
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      // role reste par défaut "client" (selon ton schema)
    });

    await Profile.create({
      user: user._id,
      firstName,
      lastName,
    });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role, // ✅ IMPORTANT
      token: generateToken(user._id),
    });
  } catch (e) {
    next(e);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role, // ✅ IMPORTANT
      token: generateToken(user._id),
    });
  } catch (e) {
    next(e);
  }
};
