import express from "express";
import User from "../models/user.js";
import Interview from "../models/Interview.js";
import Payment from "../models/payment.js";
import { protect, adminOnly } from "../middleware/authmiddleware.js";

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// Dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const totalInterviews = await Interview.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const recentUsers = await User.find()
      .select("name email isPremium createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentPayments = await Payment.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      totalInterviews,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentUsers,
      recentPayments,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Block/Unblock user
router.patch("/users/:userId/block", async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Get all interviews
router.get("/interviews", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const interviews = await Interview.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Interview.countDocuments();

    res.json({
      interviews,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Get interviews error:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
});

// Get all payments
router.get("/payments", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const payments = await Payment.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Payment.countDocuments();

    res.json({
      payments,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Get payments error:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

export default router;