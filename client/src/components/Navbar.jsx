import { Link, useNavigate } from "react-router-dom";
import { getUser, isPremium, logout } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <span className="brand-mark">IX</span>
        <span>InterviewX AI</span>
      </Link>

      <nav className="nav-right">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/interview">Practice</Link>
        {user?.role === "admin" && (
          <Link to="/admin" className="admin-link">Admin</Link>
        )}
        {user ? (
          <div className="nav-user">
            {isPremium() && <span className="premium-badge">PRO</span>}
            <span className="user-name">{user.name || user.email}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link className="btn btn-ghost" to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}