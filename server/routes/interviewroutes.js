import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  getInterviews,
  getInterviewDetails,
  nextQuestion,
  startInterview,
  deleteInterview,
} from "../controllers/interviewcontrollers.js";
import { checkInterviewLimit } from "../middleware/limitMiddleware.js";

const router = express.Router();

router.post("/start", protect, checkInterviewLimit, startInterview);
router.post("/next", protect, nextQuestion);
router.get("/history", protect, getInterviews);
router.get("/:interviewId", protect, getInterviewDetails);
router.delete("/:interviewId", protect, deleteInterview);

export default router;