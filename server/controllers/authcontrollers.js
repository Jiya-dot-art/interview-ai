import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const JWT_EXPIRY = "7d";
const JWT_REFRESH_EXPIRY = "30d";

/**
 * SAFE ENV GETTERS (IMPORTANT FIX)
 */
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }
  return process.env.JWT_SECRET;
};

const getJwtRefreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is missing in environment variables");
  }
  return process.env.JWT_REFRESH_SECRET;
};

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name || "",
      email,
      password: hashedPassword,
    });

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      getJwtRefreshSecret(),
      { expiresIn: JWT_REFRESH_EXPIRY }
    );

    await User.findByIdAndUpdate(user._id, { refreshToken });

    return res.status(201).json({
      message: "User registered successfully",
      token: accessToken,
      refreshToken,
      user,
    });

  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      getJwtRefreshSecret(),
      { expiresIn: JWT_REFRESH_EXPIRY }
    );

    await User.findByIdAndUpdate(user._id, { refreshToken });

    return res.json({
      token: accessToken,
      refreshToken,
      user,
    });

  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ================= REFRESH TOKEN ================= */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, getJwtRefreshSecret());

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRY }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id },
      getJwtRefreshSecret(),
      { expiresIn: JWT_REFRESH_EXPIRY }
    );

    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    return res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }

    return res.json({ message: "Logged out successfully" });

  } catch (err) {
    console.error("Logout error:", err.message);
    return res.status(500).json({ message: "Logout failed" });
  }
};