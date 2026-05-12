import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Web Dev Cohort 2026 Hackathon</p>

        <h1>PulseBoard</h1>

        <p className="subtitle">
          Create live polls, share public links, collect feedback and view
          real-time analytics.
        </p>

        <div className="hero-actions">
          <Link className="primary-button" to="/register">
            Get started
          </Link>

          <Link className="secondary-button" to="/login">
            Login
          </Link>
        </div>

        <div className="status-box">
          <span className="status-dot"></span>
          <span>Frontend ready. Backend auth connected.</span>
        </div>
      </section>
    </main>
  );
}

export default Home;