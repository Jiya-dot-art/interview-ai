import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { isPremium } from "../utils/auth";

export default function InterviewRoom() {
  const navigate = useNavigate();
  const [role, setRole] = useState("SDE");
  const [roundType, setRoundType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Mid");
  const [resumeText, setResumeText] = useState("");
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentQuestion, history]);

  const startInterview = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/interview/start", {
        role,
        roundType,
        difficulty,
        resumeText,
      });

      setInterviewId(res.data.interviewId);
      setCurrentQuestion(res.data.question);
      setRound(res.data.round);
      setHistory([]);
    } catch (err) {
      if (err.response?.data?.code === "UPGRADE_REQUIRED") {
        setError("Free limit reached. Please upgrade to Pro.");
        setTimeout(() => navigate("/payment"), 2000);
      } else {
        setError(err.response?.data?.message || "Failed to start interview");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) return;

    setLoading(true);
    const userAnswer = answerText;
    setAnswerText("");

    try {
      const res = await api.post("/interview/next", {
        interviewId,
        question: currentQuestion,
        answer: userAnswer,
        round,
      });

      setHistory((prev) => [
        ...prev,
        { question: currentQuestion, answer: userAnswer },
      ]);

      if (res.data.finished) {
        setFinished(true);
        setCurrentAnswer(userAnswer);
        setTimeout(() => navigate("/result", { state: { interviewId } }), 1500);
      } else {
        setCurrentQuestion(res.data.question);
        setRound(res.data.round);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit answer");
      setAnswerText(userAnswer);
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = async () => {
    setLoading(true);

    try {
      const res = await api.post("/interview/next", {
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
        setTimeout(() => navigate("/result", { state: { interviewId } }), 1500);
      } else {
        setCurrentQuestion(res.data.question);
        setRound(res.data.round);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to skip question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interview-room">
      <div className="interview-header">
        <h1>AI Interview Room</h1>
        <div className="interview-meta">
          <span className="badge">{role}</span>
          <span className="badge">{roundType}</span>
          <span className="badge">{difficulty}</span>
          {!isPremium() && <span className="free-badge">Free: {3 - round + 1} left</span>}
        </div>
      </div>

      {!interviewId ? (
        <div className="interview-setup">
          <div className="setup-card">
            <h2>Configure Your Interview</h2>

            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="SDE">Software Engineer</option>
                <option value="Frontend">Frontend Developer</option>
                <option value="Backend">Backend Developer</option>
                <option value="FullStack">Full Stack Developer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Round Type</label>
              <select value={roundType} onChange={(e) => setRoundType(e.target.value)}>
                <option value="Technical">Technical</option>
                <option value="DSA">DSA</option>
                <option value="SystemDesign">System Design</option>
                <option value="HR">HR / Behavioral</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="FullStack">Full Stack</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Beginner">Beginner</option>
                <option value="Mid">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Resume / Notes (optional)</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume or notes here for personalized questions..."
                rows={4}
              />
            </div>

            {error && <div className="error-banner">{error}</div>}

            <button
              className="btn btn-primary btn-large full-width"
              onClick={startInterview}
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Interview"}
            </button>
          </div>
        </div>
      ) : (
        <div className="interview-chat">
          <div className="chat-container">
            {/* Progress */}
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(round / 5) * 100}%` }}></div>
              <span className="progress-text">Round {round} / 5</span>
            </div>

            {/* Chat History */}
            <div className="chat-messages">
              {history.map((item, idx) => (
                <div key={idx} className="message-group">
                  <div className="message ai-message">
                    <div className="message-avatar">AI</div>
                    <div className="message-content">
                      <p>{item.question}</p>
                    </div>
                  </div>
                  {item.answer && (
                    <div className="message user-message">
                      <div className="message-avatar">You</div>
                      <div className="message-content">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Current Question */}
              {!finished && (
                <div className="message-group">
                  <div className="message ai-message">
                    <div className="message-avatar">AI</div>
                    <div className="message-content">
                      <p>{currentQuestion}</p>
                    </div>
                  </div>
                </div>
              )}

              {finished && (
                <div className="message-group">
                  <div className="message system-message">
                    <div className="message-content">
                      <p>🎉 Interview completed! Generating your report...</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            {!finished && (
              <div className="chat-input">
                {error && <div className="error-banner">{error}</div>}
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitAnswer();
                    }
                  }}
                />
                <div className="input-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={skipQuestion}
                    disabled={loading}
                  >
                    Skip
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={submitAnswer}
                    disabled={loading || !answerText.trim()}
                  >
                    {loading ? "Submitting..." : "Submit Answer"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}