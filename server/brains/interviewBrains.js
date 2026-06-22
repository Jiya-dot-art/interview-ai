import { getGroq } from "../config/groq.js";

export const interviewBrain = async ({ role, round, answer }) => {
  const groq = getGroq();

  const prompt = `
You are FAANG interviewer.

Role: ${role}
Round: ${round}

Candidate Answer:
${answer}

Generate NEXT question only.
No explanation.
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  return res.choices[0].message.content;
};