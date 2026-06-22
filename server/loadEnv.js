import dotenv from "dotenv";

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.log("❌ ENV NOT LOADED");
} else {
  console.log("✅ ENV LOADED");
}