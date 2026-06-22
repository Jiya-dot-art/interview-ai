import { getGroq } from "../config/groq.js";
import Interview from "../models/Interview.js";

export const startInterview = async (req, res) => {
  try {
    const groq = getGroq();
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role required" });
    }

    const result = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a senior technical interviewer. Ask only one first interview question.",
        },
        {
          role: "user",
          content: `Start an interview for ${role}. Ask the first question.`,
        },
      ],
      temperature: 0.7,
    });

    const question = result.choices[0].message.content.trim();

    return res.json({
      success: true,
      interviewId: Date.now().toString(),
      role,
      round: 1,
      score: 0,
      finished: false,
      question,
    });
  } catch (err) {
    console.log("START ERROR:", err.message);
    return res.status(500).json({ error: "Start failed" });
  }
};

export const nextQuestion = async (req, res) => {
  try {
    const groq = getGroq();

    let { round = 1, role, history = [] } = req.body;
    round = Number(round);

    if (!role) {
      return res.status(400).json({ error: "Role missing" });
    }

    if (round >= 5) {
      return res.json({
        finished: true,
        round: 5,
        question: "Interview completed",
      });
    }

    const previousQuestions = history
      .map((h) => h.question)
      .filter(Boolean)
      .join("\n");

    const prompt = `
You are a senior technical interviewer.

Generate exactly one technical interview question.

Rules:
- No greetings
- No explanations
- No repetition
- Must be for ${role}

Previous Questions:
${previousQuestions || "None"}
`;

    let question = "";

    try {
      const result = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      });

      question = result.choices[0].message.content.trim();
    } catch (apiErr) {
      console.log("GROQ ERROR:", apiErr.message);
    }

    if (!question || question.length < 10) {
      const fallback = [
        "Explain how a hash table works internally.",
        "Design a scalable URL shortener system.",
        "What is database indexing?",
        "Design a distributed cache system.",
        "Explain REST versus GraphQL.",
      ];

      question = fallback[(round - 1) % fallback.length];
    }

    return res.json({
      finished: false,
      round: round + 1,
      question,
    });
  } catch (err) {
    console.log("NEXT ERROR:", err.message);
    return res.status(500).json({ error: "Next question failed" });
  }
};

export const evaluateAnswer = async (req, res) => {
  try {
    const groq = getGroq();
    const { question, answer } = req.body;

    const prompt = `
Return only valid JSON:

{
  "score": number,
  "feedback": "string",
  "improvement": "string"
}

Question: ${question}
Answer: ${answer}
`;

    const result = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const text = result.choices[0].message.content;

    let evaluation;

    try {
      evaluation = JSON.parse(text);
    } catch (e) {
      evaluation = {
        score: 0,
        feedback: "Invalid AI response",
        improvement: "Try again",
        raw: text,
      };
    }

    return res.json({ evaluation });
  } catch (err) {
    console.log("EVAL ERROR:", err.message);
    return res.status(500).json({ error: "Evaluation failed" });
  }
};

export const finalReport = async (req, res) => {
  try {
    const groq = getGroq();
    const { interviewId, role, roundType, difficulty, answers } = req.body;

    const prompt = `
Return only valid JSON with no markdown:

{
  "totalScore": number,
  "strengths": [],
  "weaknesses": [],
  "idealAnswerHints": [],
  "finalVerdict": "Hired / Not Selected / Needs Improvement"
}

Role: ${role}
Round type: ${roundType || "Mixed"}
Difficulty: ${difficulty || "Mid"}

Conversation:
${JSON.stringify(answers)}
`;

    const result = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const text = result.choices[0].message.content;
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let report;

    try {
      report = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from AI",
        raw: text,
      });
    }

    if (interviewId && typeof report.totalScore === "number") {
      await Interview.findOneAndUpdate(
        { _id: interviewId, userId: req.user.id },
        { finalScore: report.totalScore }
      );
    }

    return res.json({ report });
  } catch (err) {
    console.log("REPORT ERROR:", err.message);
    return res.status(500).json({ error: "Report failed" });
  }
};
