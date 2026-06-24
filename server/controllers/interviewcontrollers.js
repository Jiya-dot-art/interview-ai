import Interview from "../models/Interview.js";
import User from "../models/user.js";
import {
  generateQuestion,
  evaluateAnswer,
  generateFinalReport,
} from "../config/groq.js";

/* ================= CONFIG ================= */
const FREE_INTERVIEW_LIMIT = 3;

/* ================= START INTERVIEW ================= */
export const startInterview = async (req, res) => {
  try {
    const {
      role,
      roundType = "Technical",
      difficulty = "Mid",
      resumeText = "",
    } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // FREE LIMIT CHECK
    if (!user.isPremium && user.interviewsUsed >= FREE_INTERVIEW_LIMIT) {
      return res.status(403).json({
        message: "Free interview limit reached",
        code: "UPGRADE_REQUIRED",
      });
    }

    const interview = await Interview.create({
      userId: req.user.id,
      role,
      roundType,
      difficulty,
      resumeText,
      qa: [],
    });

    // AI FIRST QUESTION
    const firstQuestion = await generateQuestion({
      role,
      roundType,
      difficulty,
      resumeText,
      history: [],
    });

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { interviewsUsed: 1 },
    });

    return res.json({
      interviewId: interview._id,
      question: firstQuestion,
      round: 1,
      totalRounds: 5,
    });
  } catch (err) {
    console.error("Start interview error:", err);
    return res.status(500).json({
      message: err.message || "Failed to start interview",
    });
  }
};

/* ================= NEXT QUESTION ================= */
export const nextQuestion = async (req, res) => {
  try {
    const { interviewId, question, answer, round } = req.body;

    if (!interviewId) {
      return res.status(400).json({ message: "interviewId missing" });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (String(interview.userId) !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    /* ================= SAVE Q/A + EVALUATION ================= */
    let evaluation = null;

    if (answer) {
      try {
        evaluation = await evaluateAnswer(question, answer);
      } catch (err) {
        console.log("AI evaluation failed:", err.message);
      }

      interview.qa.push({
        question,
        answer,
        feedback: evaluation?.feedback || "No feedback",
        score: evaluation?.score || 5,
      });
    }

    await interview.save();

    /* ================= FINAL ROUND ================= */
    if (round >= 5) {
      try {
        const report = await generateFinalReport({
          role: interview.role,
          roundType: interview.roundType,
          difficulty: interview.difficulty,
          qa: interview.qa,
        });

        interview.finalScore = report.totalScore;
        interview.strengths = report.strengths;
        interview.weaknesses = report.weaknesses;

        await interview.save();

        return res.json({
          finished: true,
          message: "Interview completed",
          interviewId: interview._id,
        });
      } catch (err) {
        console.log("Report error:", err.message);

        return res.json({
          finished: true,
          message: "Interview completed",
          interviewId: interview._id,
        });
      }
    }

    /* ================= NEXT AI QUESTION ================= */
    const nextQ = await generateQuestion({
      role: interview.role,
      roundType: interview.roundType,
      difficulty: interview.difficulty,
      resumeText: interview.resumeText,
      history: interview.qa,
    });

    return res.json({
      question: nextQ,
      round: round + 1,
      finished: false,
    });
  } catch (err) {
    console.error("Next question error:", err);
    return res.status(500).json({
      message: err.message || "Failed to get next question",
    });
  }
};

/* ================= GET ALL INTERVIEWS ================= */
export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    return res.json(interviews);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to fetch interviews",
    });
  }
};

/* ================= GET SINGLE INTERVIEW ================= */
export const getInterviewDetails = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.interviewId,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.json({ interview });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to fetch interview",
    });
  }
};

/* ================= DELETE INTERVIEW ================= */
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.interviewId,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to delete interview",
    });
  }
};

/* ================= ANALYTICS (DASHBOARD) ================= */
export const getAnalytics = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.id,
    });

    const totalInterviews = interviews.length;

    if (totalInterviews === 0) {
      return res.json({
        totalInterviews: 0,
        avgScore: 0,
        bestScore: 0,
        lastScore: 0,
        trend: [],
      });
    }

    let totalScore = 0;
    let bestScore = 0;

    const trend = interviews.map((interview, index) => {
      const qa = interview.qa || [];

      const avg =
        qa.length > 0
          ? qa.reduce((sum, q) => sum + (q.score || 0), 0) / qa.length
          : 0;

      totalScore += avg;
      if (avg > bestScore) bestScore = avg;

      return {
        interview: index + 1,
        score: Math.round(avg),
      };
    });

    const avgScore = totalScore / totalInterviews;

    const lastInterview = interviews[interviews.length - 1];
    const lastScore =
      lastInterview?.qa?.length > 0
        ? lastInterview.qa.reduce((a, b) => a + (b.score || 0), 0) /
          lastInterview.qa.length
        : 0;

    return res.json({
      totalInterviews,
      avgScore: Math.round(avgScore * 10) / 10,
      bestScore: Math.round(bestScore),
      lastScore: Math.round(lastScore),
      trend,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return res.status(500).json({
      message: "Failed to fetch analytics",
    });
  }
};