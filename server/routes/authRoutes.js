import express from "express";
import { login, register, refreshToken, logout } from "../controllers/authcontrollers.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;