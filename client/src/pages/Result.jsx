import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import { isPremium } from "../utils/auth";

export default function Result() {
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const interviewId = location.state?.interviewId;

  useEffect(() => {
    if (interviewId) {
      fetchReport();
    } else {
      setLoading(false);
    }
  }, [interviewId]);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/report/${interviewId}`);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="result-page">
        <div className="loading-spinner">Generating your report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="result-page">
        <div className="error-state">
          <h2>No report found</h2>
          <p>Complete an interview to see your report.</p>
          <Link to="/interview" className="btn btn-primary">Start Interview</Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "average";
    return "needs-improvement";
  };

  const getVerdictColor = (verdict) => {
    if (verdict?.includes("Hired")) return "excellent";
    if (verdict?.includes("Improvement")) return "average";
    return "needs-improvement";
  };

  return (
    <div className="result-page">
      <div className="result-header">
        <h1>Interview Report</h1>
        <p className="result-subtitle">{report.role} • {report.roundType} • {report.difficulty}</p>
      </div>

      {/* Overall Score */}
      <div className="score-overview">
        <div className="overall-score">
          <div className={`score-circle ${getScoreColor(report.finalScore)}`}>
            <span className="score-value">{report.finalScore}%</span>
          </div>
          <div className="verdict-badge">
            <span className={`verdict ${getVerdictColor(report.verdict)}`}>
              {report.verdict}
            </span>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="score-breakdown">
        <h3>Score Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <h4>Technical</h4>
            <div className={`score-bar ${getScoreColor(report.technicalScore)}`}>
              <div className="score-fill" style={{ width: `${report.technicalScore}%` }}></div>
            </div>
            <span className="score-text">{report.technicalScore}%</span>
          </div>

          <div className="breakdown-card">
            <h4>Communication</h4>
            <div className={`score-bar ${getScoreColor(report.communicationScore)}`}>
              <div className="score-fill" style={{ width: `${report.communicationScore}%` }}></div>
            </div>
            <span className="score-text">{report.communicationScore}%</span>
          </div>

          <div className="breakdown-card">
            <h4>Problem Solving</h4>
            <div className={`score-bar ${getScoreColor(report.problemSolvingScore)}`}>
              <div className="score-fill" style={{ width: `${report.problemSolvingScore}%` }}></div>
            </div>
            <span className="score-text">{report.problemSolvingScore}%</span>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="insights-section">
        <div className="insight-card strengths">
          <h3>💪 Strengths</h3>
          <ul>
            {report.strengths?.map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="insight-card weaknesses">
          <h3>🎯 Areas to Improve</h3>
          <ul>
            {report.weaknesses?.map((weakness, idx) => (
              <li key={idx}>{weakness}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Improvement Topics */}
      <div className="topics-card">
        <h3>📚 Recommended Topics</h3>
        <div className="topics-list">
          {report.improvementTopics?.map((topic, idx) => (
            <span key={idx} className="topic-tag">{topic}</span>
          ))}
        </div>
      </div>

      {/* Study Plan */}
      <div className="study-plan-card">
        <h3>📖 Personalized Study Plan</h3>
        <p>{report.studyPlan}</p>
      </div>

      {/* Q&A Review */}
      {isPremium() && report.qa && (
        <div className="qa-review">
          <h3>Question & Answer Review</h3>
          <div className="qa-list">
            {report.qa.map((item, idx) => (
              <div key={idx} className="qa-item">
                <div className="qa-question">
                  <strong>Q{idx + 1}:</strong> {item.question}
                </div>
                {item.answer && (
                  <div className="qa-answer">
                    <strong>Your Answer:</strong> {item.answer}
                  </div>
                )}
                {item.feedback && (
                  <div className="qa-feedback">
                    <strong>Feedback:</strong> {item.feedback}
                  </div>
                )}
                {item.score && (
                  <div className={`qa-score ${getScoreColor(item.score)}`}>
                    Score: {item.score}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Download for Premium */}
      {isPremium() && (
        <div className="download-section">
          <button
            className="btn btn-primary btn-large"
            onClick={() => window.print()}
          >
            📄 Download PDF Report
          </button>
        </div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!isPremium() && (
        <div className="upgrade-prompt">
          <h3>🚀 Unlock Full Report</h3>
          <p>Upgrade to Pro to access detailed Q&A review, PDF reports, and advanced analytics.</p>
          <Link to="/payment" className="btn btn-primary btn-large">
            Upgrade to Pro - ₹199/month
          </Link>
        </div>
      )}

      <div className="result-actions">
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
        <Link to="/interview" className="btn btn-primary">New Interview</Link>
      </div>
    </div>
  );
}