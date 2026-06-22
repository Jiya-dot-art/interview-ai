import express from "express";
import { createOrder, verifyPayment, getPaymentHistory } from "../controllers/paymentcontroller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/history", protect, getPaymentHistory);

export default router;