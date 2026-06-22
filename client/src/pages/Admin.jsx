import { useState, useEffect } from "react";
import api from "../api/axios";
import { getUser } from "../utils/auth";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
      setUsers(res.data.recentUsers || []);
      setPayments(res.data.recentPayments || []);
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? "unblock" : "block"} this user?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/block`, { isBlocked: !currentStatus });
      fetchStats();
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name || "Admin"}</p>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-content">
            <h3>Total Users</h3>
            <p className="admin-stat-value">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💎</div>
          <div className="admin-stat-content">
            <h3>Premium Users</h3>
            <p className="admin-stat-value">{stats?.premiumUsers || 0}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🎤</div>
          <div className="admin-stat-content">
            <h3>Total Interviews</h3>
            <p className="admin-stat-value">{stats?.totalInterviews || 0}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💰</div>
          <div className="admin-stat-content">
            <h3>Total Revenue</h3>
            <p className="admin-stat-value">₹{stats?.totalRevenue || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`admin-tab ${activeTab === "interviews" ? "active" : ""}`}
          onClick={() => setActiveTab("interviews")}
        >
          Interviews
        </button>
        <button
          className={`admin-tab ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          Payments
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="admin-card">
              <h3>Recent Users</h3>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentUsers?.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name || "N/A"}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`plan-badge ${u.isPremium ? "premium" : "free"}`}>
                            {u.isPremium ? "Pro" : "Free"}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-card">
              <h3>Recent Payments</h3>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentPayments?.map((p) => (
                      <tr key={p._id}>
                        <td>{p.userId?.name || p.userId?.email || "N/A"}</td>
                        <td>₹{p.amount}</td>
                        <td>
                          <span className={`status-badge ${p.status}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-section">
            <div className="admin-card">
              <h3>All Users</h3>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Interviews</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name || "N/A"}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`plan-badge ${u.isPremium ? "premium" : "free"}`}>
                            {u.isPremium ? "Pro" : "Free"}
                          </span>
                        </td>
                        <td>{u.interviewCount || 0}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className={`btn btn-small ${u.isBlocked ? "btn-secondary" : "btn-danger"}`}
                            onClick={() => handleBlockUser(u._id, u.isBlocked)}
                          >
                            {u.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "interviews" && (
          <div className="interviews-section">
            <div className="admin-card">
              <h3>All Interviews</h3>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Round Type</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map((i) => (
                      <tr key={i._id}>
                        <td>{i.userId?.name || i.userId?.email || "N/A"}</td>
                        <td>{i.role}</td>
                        <td>{i.roundType}</td>
                        <td>
                          {i.finalScore ? (
                            <span className={`score-badge ${i.finalScore >= 80 ? "excellent" : i.finalScore >= 60 ? "good" : "average"}`}>
                              {i.finalScore}%
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="payments-section">
            <div className="admin-card">
              <h3>All Payments</h3>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Order ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td>{p.userId?.name || p.userId?.email || "N/A"}</td>
                        <td>{p.orderId}</td>
                        <td>₹{p.amount}</td>
                        <td>
                          <span className={`status-badge ${p.status}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}