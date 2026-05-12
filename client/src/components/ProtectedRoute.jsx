import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isCheckingAuth, isLoggedIn } = useAuth();

  if (isCheckingAuth) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <p className="eyebrow">PulseBoard</p>
          <h2>Checking your session...</h2>
        </section>
      </main>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;