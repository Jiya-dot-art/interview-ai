import express from "express";
import User from "../models/user.js";
import Interview from "../models/Interview.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Get user profile with full details
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      interviewsUsed: user.interviewsUsed,
      maxInterviews: user.maxInterviews,
      interviewCount: user.interviewCount,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Get detailed analytics
router.get("/analytics", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalInterviews = interviews.length;
    
    // Calculate scores
    const scoredInterviews = interviews.filter(i => typeof i.finalScore === 'number');
    const avgScore = scoredInterviews.length 
      ? scoredInterviews.reduce((sum, i) => sum + i.finalScore, 0) / scoredInterviews.length 
      : 0;
    const bestScore = scoredInterviews.length 
      ? Math.max(...scoredInterviews.map(i => i.finalScore)) 
      : 0;

    // Calculate improvement (compare last 3 vs previous 3)
    let improvement = 0;
    if (interviews.length >= 6) {
      const recent3 = interviews.slice(0, 3).filter(i => typeof i.finalScore === 'number');
      const previous3 = interviews.slice(3, 6).filter(i => typeof i.finalScore === 'number');
      if (recent3.length && previous3.length) {
        const recentAvg = recent3.reduce((sum, i) => sum + i.finalScore, 0) / recent3.length;
        const previousAvg = previous3.reduce((sum, i) => sum + i.finalScore, 0) / previous3.length;
        improvement = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
      }
    }

    // Calculate streak (consecutive days with interviews)
    const interviewDates = [...new Set(interviews.map(i => 
      new Date(i.createdAt).toDateString()
    ))].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (interviewDates.length > 0) {
      if (interviewDates[0] === today || interviewDates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < interviewDates.length; i++) {
          const current = new Date(interviewDates[i - 1]);
          const previous = new Date(interviewDates[i]);
          const diffDays = (current - previous) / (1000 * 60 * 60 * 24);
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Recent interviews
    const recentInterviews = interviews.slice(0, 5).map(i => ({
      id: i._id,
      role: i.role,
      roundType: i.roundType,
      difficulty: i.difficulty,
      finalScore: i.finalScore,
      createdAt: i.createdAt,
    }));

    // Calculate weak and strong areas based on round types
    const roundScores = {};
    interviews.forEach(i => {
      if (typeof i.finalScore === 'number') {
        if (!roundScores[i.roundType]) {
          roundScores[i.roundType] = { total: 0, count: 0 };
        }
        roundScores[i.roundType].total += i.finalScore;
        roundScores[i.roundType].count += 1;
      }
    });

    const roundAverages = Object.entries(roundScores).map(([type, data]) => ({
      type,
      avgScore: data.total / data.count,
    })).sort((a, b) => a.avgScore - b.avgScore);

    const weakAreas = roundAverages.slice(0, 2).map(r => r.type);
    const strongAreas = roundAverages.slice(-2).reverse().map(r => r.type);

    // Score distribution for charts
    const scoreDistribution = {
      excellent: interviews.filter(i => i.finalScore >= 80).length,
      good: interviews.filter(i => i.finalScore >= 60 && i.finalScore < 80).length,
      average: interviews.filter(i => i.finalScore >= 40 && i.finalScore < 60).length,
      needsImprovement: interviews.filter(i => i.finalScore < 40).length,
    };

    res.json({
      totalInterviews,
      avgScore: avgScore.toFixed(2),
      bestScore,
      improvement: improvement.toFixed(2),
      streak,
      weakAreas,
      strongAreas,
      recentInterviews,
      scoreDistribution,
      isPremium: user.isPremium,
      remainingFree: user.isPremium 
        ? "Unlimited" 
        : Math.max(0, user.maxInterviews - user.interviewsUsed),
      subscriptionEnd: user.subscriptionEnd,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// Get interview history with details
router.get("/interviews", protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const interviews = await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Interview.countDocuments({ userId });

    res.json({
      interviews,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Interview history error:", err);
    res.status(500).json({ message: "Failed to fetch interview history" });
  }
});

// Get single interview details
router.get("/interviews/:interviewId", protect, async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({ interview });
  } catch (err) {
    console.error("Get interview error:", err);
    res.status(500).json({ message: "Failed to fetch interview" });
  }
});

export default router;