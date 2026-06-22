import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

export default function AdminRoute({ children }) {
  const user = getUser();

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}