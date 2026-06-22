import Joi from "joi";

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ message: messages });
  }
  next();
};

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Valid email required",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  name: Joi.string().max(60).allow("", null),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const interviewStartSchema = Joi.object({
  role: Joi.string().required(),
  roundType: Joi.string().allow("", null),
  difficulty: Joi.string().allow("", null),
  resumeText: Joi.string().allow("", null),
});

export const paymentVerifySchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});
