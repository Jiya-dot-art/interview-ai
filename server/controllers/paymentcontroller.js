import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/user.js";
import Payment from "../models/payment.js";

export const createOrder = async (req, res) => {
  try {
    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials missing:", {
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      });
      return res.status(500).json({ 
        message: "Payment gateway configuration error. Please contact support.",
        ...(process.env.NODE_ENV === "development" && { 
          error: "Razorpay credentials not configured" 
        })
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = Number(process.env.PRO_PLAN_PRICE_INR || 199);

    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid amount:", amount);
      return res.status(500).json({ 
        message: "Invalid payment amount configured",
        ...(process.env.NODE_ENV === "development" && { 
          error: `Amount ${amount} is invalid` 
        })
      });
    }

    let order;
    try {
      // Razorpay receipt must be <= 40 characters
      const shortReceipt = `intx_${req.user.id.toString().slice(-8)}_${Date.now().toString().slice(-6)}`;
      
      order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: shortReceipt,
        notes: {
          userId: req.user.id,
          planType: "pro",
        },
      });
    } catch (razorpayError) {
      console.error("Razorpay API Error:", razorpayError.message);
      console.error("Razorpay Error Details:", razorpayError);
      return res.status(500).json({ 
        message: "Failed to create order with payment gateway",
        ...(process.env.NODE_ENV === "development" && { 
          error: razorpayError.message,
          stack: razorpayError.stack 
        })
      });
    }

    // Save order to database
    let paymentRecord;
    try {
      paymentRecord = await Payment.create({
        userId: req.user.id,
        orderId: order.id,
        amount: amount,
        status: "created",
        planType: "pro",
      });
    } catch (dbError) {
      console.error("Database Error saving payment:", dbError.message);
      console.error("Database Error Details:", dbError);
      return res.status(500).json({ 
        message: "Failed to save payment record",
        ...(process.env.NODE_ENV === "development" && { 
          error: dbError.message,
          stack: dbError.stack 
        })
      });
    }

    return res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("ORDER ERROR (unexpected):", err);
    return res.status(500).json({ 
      message: "Order creation failed",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment fields",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        status: "paid",
      }
    );

    // Calculate subscription end date (30 days from now)
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

    // Update user subscription
    await User.findByIdAndUpdate(req.user.id, {
      isPremium: true,
      subscriptionPlan: "pro",
      subscriptionStart,
      subscriptionEnd,
      paymentId: razorpay_payment_id,
      maxInterviews: 999999, // Unlimited for pro users
    });

    return res.json({
      success: true,
      message: "Payment verified and subscription activated",
      subscriptionEnd,
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ payments });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
};