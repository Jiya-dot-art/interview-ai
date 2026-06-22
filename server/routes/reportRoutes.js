import express from "express";
import Interview from "../models/Interview.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Get report for a completed interview
router.get("/:interviewId", protect, async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (!interview.finalScore) {
      return res.status(400).json({ message: "Report not yet generated. Complete the interview first." });
    }

    res.json({
      interviewId: interview._id,
      role: interview.role,
      roundType: interview.roundType,
      difficulty: interview.difficulty,
      finalScore: interview.finalScore,
      technicalScore: interview.technicalScore,
      communicationScore: interview.communicationScore,
      problemSolvingScore: interview.problemSolvingScore,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      improvementTopics: interview.improvementTopics,
      studyPlan: interview.studyPlan,
      qa: interview.qa,
      createdAt: interview.createdAt,
    });
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ message: "Failed to fetch report" });
  }
});

export default router;