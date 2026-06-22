import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  MONGO_URI: process.env.MONGO_URI,
};