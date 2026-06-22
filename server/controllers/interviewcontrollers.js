import Interview from "../models/Interview.js";
import User, { FREE_INTERVIEW_LIMIT } from "../models/user.js";
import { generateQuestion, evaluateAnswer, generateFinalReport } from "../config/groq.js";

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

    // Check if user has available interviews
    const user = await User.findById(req.user.id);
    if (!user.isPremium && user.interviewsUsed >= user.maxInterviews) {
      return res.status(403).json({
        message: "Free interview limit reached. Upgrade to Pro for unlimited practice.",
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

    const firstQuestion = await generateQuestion({
      role,
      roundType,
      difficulty,
      resumeText,
      history: [],
    });

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { interviewsUsed: 1, interviewCount: 1 },
    });

    return res.json({
      interviewId: interview._id,
      question: firstQuestion,
      round: 1,
      totalRounds: 5,
    });
  } catch (err) {
    console.error("Start interview error:", err);
    return res.status(500).json({ message: err.message || "Failed to start interview" });
  }
};

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
      return res.status(403).json({ message: "Not allowed" });
    }

    // Evaluate the answer if provided
    let evaluation = null;
    if (question && answer) {
      try {
        evaluation = await evaluateAnswer(question, answer);
        
        // Save Q&A with evaluation
        interview.qa.push({
          question,
          answer,
          feedback: evaluation.feedback,
          score: evaluation.score,
          improvement: evaluation.improvement,
        });
      } catch (evalError) {
        console.error("Evaluation error:", evalError);
        // Continue without evaluation
        interview.qa.push({ question, answer });
      }
    } else if (question) {
      interview.qa.push({ question });
    }

    await interview.save();

    // Check if interview is complete
    if (round >= 5) {
      // Generate final report
      try {
        const report = await generateFinalReport({
          role: interview.role,
          roundType: interview.roundType,
          difficulty: interview.difficulty,
          qa: interview.qa,
        });

        // Update interview with final scores
        interview.finalScore = report.totalScore;
        interview.technicalScore = report.technicalScore;
        interview.communicationScore = report.communicationScore;
        interview.problemSolvingScore = report.problemSolvingScore;
        interview.strengths = report.strengths;
        interview.weaknesses = report.weaknesses;
        interview.improvementTopics = report.improvementTopics;
        interview.studyPlan = report.studyPlan;
        await interview.save();

        return res.json({
          finished: true,
          message: "Interview completed",
          interviewId: interview._id,
        });
      } catch (reportError) {
        console.error("Report generation error:", reportError);
        return res.json({
          finished: true,
          message: "Interview completed",
          interviewId: interview._id,
        });
      }
    }

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
    return res.status(500).json({ message: err.message || "Failed to get next question" });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    return res.json(interviews);
  } catch (err) {
    console.error("Get interviews error:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch interviews" });
  }
};

export const getInterviewDetails = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.json({ interview });
  } catch (err) {
    console.error("Get interview details error:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch interview details" });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findOneAndDelete({
      _id: interviewId,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.json({ message: "Interview deleted successfully" });
  } catch (err) {
    console.error("Delete interview error:", err);
    return res.status(500).json({ message: err.message || "Failed to delete interview" });
  }
};