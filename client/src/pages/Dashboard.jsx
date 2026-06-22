import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getUser, isPremium } from "../utils/auth";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, interviewsRes] = await Promise.all([
        api.get("/user/analytics"),
        api.get("/user/interviews"),
      ]);
      setAnalytics(analyticsRes.data);
      setInterviews(interviewsRes.data.interviews || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const stats = analytics || {
    totalInterviews: 0,
    avgScore: 0,
    bestScore: 0,
    improvement: 0,
    streak: 0,
    weakAreas: [],
    strongAreas: [],
    recentInterviews: [],
    scoreDistribution: { excellent: 0, good: 0, average: 0, needsImprovement: 0 },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name || "User"} 👋</h1>
          <p className="dashboard-subtitle">Track your interview preparation progress</p>
        </div>
        <div className="dashboard-actions">
          {!isPremium() && (
            <Link to="/payment" className="btn btn-primary">
              Upgrade to Pro
            </Link>
          )}
          <Link to="/interview" className="btn btn-secondary">
            Start Interview
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Interviews</h3>
            <p className="stat-value">{stats.totalInterviews}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Average Score</h3>
            <p className="stat-value">{stats.avgScore}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Best Score</h3>
            <p className="stat-value">{stats.bestScore}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Improvement</h3>
            <p className={`stat-value ${Number(stats.improvement) > 0 ? "positive" : "neutral"}`}>
              {Number(stats.improvement) > 0 ? "+" : ""}{stats.improvement}%
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <p className="stat-value">{stats.streak} days</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-content">
            <h3>Plan</h3>
            <p className="stat-value">{isPremium() ? "Pro" : "Free"}</p>
          </div>
        </div>
      </div>

      {/* Weak & Strong Areas */}
      <div className="insights-grid">
        <div className="insight-card weak-areas">
          <h3>🎯 Areas to Improve</h3>
          {stats.weakAreas && stats.weakAreas.length > 0 ? (
            <ul>
              {stats.weakAreas.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Complete more interviews to see insights</p>
          )}
        </div>

        <div className="insight-card strong-areas">
          <h3>💪 Strong Areas</h3>
          {stats.strongAreas && stats.strongAreas.length > 0 ? (
            <ul>
              {stats.strongAreas.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Complete more interviews to see insights</p>
          )}
        </div>
      </div>

      {/* Score Distribution Chart */}
      <div className="chart-card">
        <h3>Score Distribution</h3>
        <div className="chart-bars">
          <div className="chart-bar">
            <div className="bar-fill excellent" style={{ height: `${(stats.scoreDistribution.excellent / Math.max(stats.totalInterviews, 1)) * 100}%` }}></div>
            <span className="bar-label">Excellent (80+)</span>
            <span className="bar-value">{stats.scoreDistribution.excellent}</span>
          </div>
          <div className="chart-bar">
            <div className="bar-fill good" style={{ height: `${(stats.scoreDistribution.good / Math.max(stats.totalInterviews, 1)) * 100}%` }}></div>
            <span className="bar-label">Good (60-79)</span>
            <span className="bar-value">{stats.scoreDistribution.good}</span>
          </div>
          <div className="chart-bar">
            <div className="bar-fill average" style={{ height: `${(stats.scoreDistribution.average / Math.max(stats.totalInterviews, 1)) * 100}%` }}></div>
            <span className="bar-label">Average (40-59)</span>
            <span className="bar-value">{stats.scoreDistribution.average}</span>
          </div>
          <div className="chart-bar">
            <div className="bar-fill needs-improvement" style={{ height: `${(stats.scoreDistribution.needsImprovement / Math.max(stats.totalInterviews, 1)) * 100}%` }}></div>
            <span className="bar-label">Needs Work </span>
            <span className="bar-value">{stats.scoreDistribution.needsImprovement}</span>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="recent-card">
        <div className="recent-header">
          <h3>Recent Interviews</h3>
          <Link to="/interview" className="btn btn-small">New Interview</Link>
        </div>
        {interviews.length > 0 ? (
          <div className="interview-list">
            {interviews.slice(0, 5).map((interview) => (
              <div key={interview._id} className="interview-item">
                <div className="interview-info">
                  <h4>{interview.role}</h4>
                  <p>{interview.roundType} • {interview.difficulty}</p>
                </div>
                <div className="interview-meta">
                  {interview.finalScore && (
                    <span className={`score-badge ${interview.finalScore >= 80 ? "excellent" : interview.finalScore >= 60 ? "good" : "average"}`}>
                      {interview.finalScore}%
                    </span>
                  )}
                  <span className="interview-date">
                    {new Date(interview.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No interviews yet. Start your first interview!</p>
            <Link to="/interview" className="btn btn-primary">Start Interview</Link>
          </div>
        )}
      </div>

      {/* Upgrade Prompt for Free Users */}
      {!isPremium() && (
        <div className="upgrade-card">
          <div className="upgrade-content">
            <h3>🚀 Unlock Unlimited Practice</h3>
            <p>Get unlimited interviews, advanced AI feedback, PDF reports, and detailed analytics.</p>
            <ul>
              <li>✓ Unlimited interviews</li>
              <li>✓ Advanced AI feedback</li>
              <li>✓ PDF reports</li>
              <li>✓ Detailed analytics</li>
            </ul>
            <Link to="/payment" className="btn btn-primary btn-large">
              Upgrade to Pro - ₹199/month
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}