import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { isPremium } from "../utils/auth";

export default function InterviewRoom() {
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [role, setRole] = useState("SDE");
  const [roundType, setRoundType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Mid");
  const [resumeText, setResumeText] = useState("");

  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answerText, setAnswerText] = useState("");

  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentQuestion, history]);

  // ================= START INTERVIEW =================
  const startInterview = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post(`${API}/api/interview/start`, {
        role,
        roundType,
        difficulty,
        resumeText,
      });

      setInterviewId(res.data.interviewId);
      setCurrentQuestion(res.data.question || "Introduce yourself");
      setRound(1);
      setHistory([]);
      setFinished(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT ANSWER =================
  const submitAnswer = async () => {
    if (!answerText.trim() || !interviewId) return;

    const userAnswer = answerText;
    setAnswerText("");

    setHistory((prev) => [
      ...prev,
      { question: currentQuestion, answer: userAnswer },
    ]);

    setLoading(true);

    try {
      const res = await api.post(`${API}/api/interview/next`, {
        interviewId,
        question: currentQuestion,
        answer: userAnswer,
        round,
      });

      if (res.data.finished) {
        setFinished(true);

        setTimeout(() => {
          navigate("/result", { state: { interviewId } });
        }, 1200);

        return;
      }

      setCurrentQuestion(res.data.question);
      setRound((r) => r + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit answer");
      setAnswerText(userAnswer);
    } finally {
      setLoading(false);
    }
  };

  // ================= SKIP QUESTION =================
  const skipQuestion = async () => {
    setLoading(true);

    try {
      const res = await api.post(`${API}/api/interview/next`, {
        interviewId,
        question: currentQuestion,
        answer: "",
        round,
      });

      setHistory((prev) => [
        ...prev,
        { question: currentQuestion, answer: "Skipped" },
      ]);

      if (res.data.finished) {
        setFinished(true);

        setTimeout(() => {
          navigate("/result", { state: { interviewId } });
        }, 1200);

        return;
      }

      setCurrentQuestion(res.data.question);
      setRound((r) => r + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to skip");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="interview-room">

      <h1>AI Interview Room</h1>

      <div className="badge-row">
        <span>{role}</span>
        <span>{roundType}</span>
        <span>{difficulty}</span>
        {!isPremium() && <span>Free Mode</span>}
      </div>

      {/* SETUP */}
      {!interviewId ? (
        <div className="setup">

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>SDE</option>
            <option>Frontend</option>
            <option>Backend</option>
            <option>FullStack</option>
          </select>

          <select value={roundType} onChange={(e) => setRoundType(e.target.value)}>
            <option>Technical</option>
            <option>DSA</option>
            <option>System Design</option>
            <option>HR</option>
          </select>

          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option>Beginner</option>
            <option>Mid</option>
            <option>Advanced</option>
          </select>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste resume (optional)"
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button onClick={startInterview} disabled={loading}>
            {loading ? "Starting..." : "Start Interview"}
          </button>

        </div>
      ) : (

        // CHAT
        <div className="chat">

          <div className="history">
            {history.map((h, i) => (
              <div key={i}>
                <p>🤖 {h.question}</p>
                <p>🧑 {h.answer}</p>
              </div>
            ))}

            {!finished && <h3>🤖 {currentQuestion}</h3>}
          </div>

          {!finished && (
            <div className="input-box">

              {error && <p style={{ color: "red" }}>{error}</p>}

              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type answer..."
              />

              <button onClick={skipQuestion}>Skip</button>

              <button
                onClick={submitAnswer}
                disabled={loading || !answerText.trim()}
              >
                {loading ? "Sending..." : "Send"}
              </button>

            </div>
          )}

          {finished && <h2>🎯 Interview Completed</h2>}

          <div ref={chatEndRef} />
        </div>
      )}
    </div>
  );
}