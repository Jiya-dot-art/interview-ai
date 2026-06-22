import User from "../models/user.js";

export const checkInterviewLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Account blocked. Contact support.",
        code: "BLOCKED",
      });
    }

    if (!user.isPremium && user.interviewsUsed >= user.maxInterviews) {
      return res.status(403).json({
        message: "Free interview limit reached. Upgrade to Pro for unlimited practice.",
        code: "UPGRADE_REQUIRED",
      });
    }

    req.userData = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
