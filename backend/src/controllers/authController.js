import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
    });
    await user.save();

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
