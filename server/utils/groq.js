import { getGroqClient } from "../config/groq.js";

export const generateQuestion = async ({ role, history }) => {
  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a strict FAANG interviewer.",
      },
      {
        role: "user",
        content: `
Role: ${role}

History:
${history.map((h, i) => `Q${i + 1}: ${h.question} A${i + 1}: ${h.answer}`).join("\n")}

Ask NEXT interview question.
        `,
      },
    ],
  });

  return response.choices[0].message.content;
};