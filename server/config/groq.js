import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

let groq = null;

export const getGroq = () => {
  if (!groq) {
    groq = {
      chat: {
        completions: {
          create: async (payload) => {
            const response = await axios.post(GROQ_API_URL, payload, {
              headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
              timeout: 30000,
            });

            return response.data;
          },
        },
      },
    };
  }

  return groq;
};

const ROUND_GUIDANCE = {
  Technical: "Ask one practical technical concept question about engineering tradeoffs, architecture, debugging, or implementation.",
  DSA: "Ask one data structures and algorithms question. Keep it solvable in 20 minutes and ask for approach plus complexity.",
  SystemDesign: "Ask one system design question with clear scale and constraints. Do not ask multiple subquestions.",
  Resume: "Ask one question directly based on the candidate resume or project experience.",
  Behavioral: "Ask one behavioral interview question using a real workplace scenario.",
  HR: "Ask one HR/behavioral question about culture fit, teamwork, or career goals.",
  Frontend: "Ask one frontend-specific question about React, CSS, browser APIs, or performance.",
  Backend: "Ask one backend-specific question about APIs, databases, caching, or microservices.",
  FullStack: "Ask one full-stack question spanning frontend and backend integration.",
};

export const generateQuestion = async ({
  role,
  roundType = "Technical",
  difficulty = "Mid",
  resumeText = "",
  history = [],
}) => {
  const client = getGroq();
  const previousQuestions = history
    .map((item, index) => `Q${index + 1}: ${item.question}`)
    .join("\n");

  const compactResume = resumeText
    ? resumeText.replace(/\s+/g, " ").slice(0, 2200)
    : "No resume provided.";

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are a strict interview coach.
Ask exactly one question.
Keep it under 45 words.
No greeting, explanation, bullets, markdown, or answer.
Avoid repeating previous questions.
Make the question specific and useful.`,
      },
      {
        role: "user",
        content: `
Role: ${role}
Round type: ${roundType}
Difficulty: ${difficulty}

Round guidance:
${ROUND_GUIDANCE[roundType] || ROUND_GUIDANCE.Technical}

Resume context:
${compactResume}

Previous questions:
${previousQuestions || "None"}

Ask the next question now.
`,
      },
    ],
    temperature: 0.65,
    max_tokens: 90,
  });

  return response.choices[0].message.content.trim();
};

export const evaluateAnswer = async (question, answer) => {
  const client = getGroq();

  const prompt = `
You are an expert technical interviewer. Evaluate the following answer.

Return ONLY valid JSON (no markdown, no extra text):
{
  "score": number (0-100),
  "feedback": "string (2-3 sentences of constructive feedback)",
  "improvement": "string (1-2 sentences on how to improve)"
}

Question: ${question}
Answer: ${answer}
`;

  try {
    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
    });

    const text = result.choices[0].message.content.trim();
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let evaluation;
    try {
      evaluation = JSON.parse(cleaned);
    } catch (e) {
      // Try to extract JSON from the text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    }

    return {
      score: Math.min(100, Math.max(0, evaluation.score || 0)),
      feedback: evaluation.feedback || "Good attempt!",
      improvement: evaluation.improvement || "Keep practicing.",
    };
  } catch (err) {
    console.error("Evaluation error:", err);
    return {
      score: 50,
      feedback: "Answer received. Keep practicing to improve your responses.",
      improvement: "Focus on being more specific and structured in your answers.",
    };
  }
};

export const generateFinalReport = async ({
  role,
  roundType,
  difficulty,
  qa = [],
}) => {
  const client = getGroq();

  const conversation = qa
    .map((item, index) => `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer || "No answer"}\nScore: ${item.score || "N/A"}\n`)
    .join("\n");

  const prompt = `
You are an expert interview coach. Analyze this complete interview and generate a comprehensive report.

Return ONLY valid JSON (no markdown, no extra text):
{
  "totalScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "improvementTopics": ["string", "string", "string"],
  "studyPlan": "string (2-3 sentences of personalized study plan)",
  "verdict": "string (Hired / Strong Hire / Needs Improvement / Not Selected)"
}

Role: ${role}
Round Type: ${roundType}
Difficulty: ${difficulty}

Interview Conversation:
${conversation}

Generate the report now.
`;

  try {
    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = result.choices[0].message.content.trim();
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let report;
    try {
      report = JSON.parse(cleaned);
    } catch (e) {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in report");
      }
    }

    return {
      totalScore: Math.min(100, Math.max(0, report.totalScore || 50)),
      technicalScore: Math.min(100, Math.max(0, report.technicalScore || 50)),
      communicationScore: Math.min(100, Math.max(0, report.communicationScore || 50)),
      problemSolvingScore: Math.min(100, Math.max(0, report.problemSolvingScore || 50)),
      strengths: Array.isArray(report.strengths) ? report.strengths : ["Good effort"],
      weaknesses: Array.isArray(report.weaknesses) ? report.weaknesses : ["Keep practicing"],
      improvementTopics: Array.isArray(report.improvementTopics) ? report.improvementTopics : ["Technical depth"],
      studyPlan: report.studyPlan || "Focus on consistent practice and reviewing core concepts.",
      verdict: report.verdict || "Needs Improvement",
    };
  } catch (err) {
    console.error("Report generation error:", err);
    return {
      totalScore: 50,
      technicalScore: 50,
      communicationScore: 50,
      problemSolvingScore: 50,
      strengths: ["Completed the interview"],
      weaknesses: ["Keep practicing"],
      improvementTopics: ["All areas"],
      studyPlan: "Continue practicing regularly to improve your skills.",
      verdict: "Needs Improvement",
    };
  }
};