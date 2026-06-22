import mongoose from "mongoose";

export const FREE_INTERVIEW_LIMIT = 3;
export const PRO_PLAN_DAYS = 30;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    subscriptionStart: Date,
    subscriptionEnd: Date,
    paymentId: String,
    interviewsUsed: {
      type: Number,
      default: 0,
    },
    maxInterviews: {
      type: Number,
      default: FREE_INTERVIEW_LIMIT,
    },
    interviewCount: {
      type: Number,
      default: 0,
    },
    lastInterviewReset: {
      type: Date,
      default: Date.now,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshToken: String,
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
  },
  { timestamps: true }
);

userSchema.methods.isSubscriptionActive = function () {
  if (!this.isPremium || !this.subscriptionEnd) return false;
  return new Date() < this.subscriptionEnd;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
