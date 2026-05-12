import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="dashboard-shell">
      <nav className="topbar">
        <div>
          <p className="eyebrow">PulseBoard</p>
          <h2>Creator Dashboard</h2>
        </div>

        <button className="ghost-button" type="button" onClick={logout}>
          Logout
        </button>
      </nav>

      <section className="dashboard-grid">
        <article className="dashboard-card wide-card">
          <p className="eyebrow">Welcome</p>
          <h1>Hello, {user?.name}</h1>
          <p className="subtitle">
            Your account is ready. Next we will add poll creation, public links
            and live analytics.
          </p>

          <button className="primary-button" type="button">
            Create your first poll
          </button>
        </article>

        <article className="dashboard-card">
          <span className="metric-value">0</span>
          <p className="metric-label">Polls created</p>
        </article>

        <article className="dashboard-card">
          <span className="metric-value">0</span>
          <p className="metric-label">Responses collected</p>
        </article>

        <article className="dashboard-card">
          <span className="status-pill">Ready</span>
          <p className="metric-label">Auth system</p>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;