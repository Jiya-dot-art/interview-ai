import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: String,
    roundType: String,
    difficulty: String,
    resumeText: String,

    qa: [
      {
        question: String,
        answer: String,
        feedback: String,
        score: Number,
      },
    ],

    finalScore: Number,
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    strengths: [String],
    weaknesses: [String],
    improvementTopics: [String],
    studyPlan: String,
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
