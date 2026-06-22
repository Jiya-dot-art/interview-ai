import Interview from "../models/Interview.js";

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const interviews = await Interview.find({ userId });

    if (interviews.length === 0) {
      return res.json({
        totalInterviews: 0,
        avgScore: 0,
        bestScore: 0,
        recent: [],
      });
    }

    let totalScore = 0;
    let bestScore = 0;

    interviews.forEach((i) => {
      const score = i.finalScore || 0;
      totalScore += score;
      if (score > bestScore) bestScore = score;
    });

    const avgScore = totalScore / interviews.length;

    res.json({
      totalInterviews: interviews.length,
      avgScore: avgScore.toFixed(2),
      bestScore,
      recent: interviews.slice(-5).reverse(),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};