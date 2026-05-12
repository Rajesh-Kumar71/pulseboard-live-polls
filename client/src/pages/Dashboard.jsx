import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  const [polls, setPolls] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPolls() {
      try {
        const response = await api.get("/api/polls/my");
        setPolls(response.data.polls);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Unable to load your polls",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPolls();
  }, []);

  function getPublicLink(slug) {
    return `${window.location.origin}/polls/${slug}`;
  }

  async function copyPollLink(slug) {
    await navigator.clipboard.writeText(getPublicLink(slug));
  }

  const activePolls = polls.filter((poll) => poll.status === "active").length;
  const publishedPolls = polls.filter((poll) => poll.isPublished).length;

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
            Create polls, share links and collect live feedback from your
            audience.
          </p>

          <Link className="primary-button" to="/polls/new">
            Create your first poll
          </Link>
        </article>

        <article className="dashboard-card">
          <span className="metric-value">{polls.length}</span>
          <p className="metric-label">Polls created</p>
        </article>

        <article className="dashboard-card">
          <span className="metric-value">{activePolls}</span>
          <p className="metric-label">Active polls</p>
        </article>

        <article className="dashboard-card">
          <span className="metric-value">{publishedPolls}</span>
          <p className="metric-label">Published results</p>
        </article>
      </section>

      <section className="dashboard-card poll-list-card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">My polls</p>
            <h2>Recent polls</h2>
          </div>

          <Link className="secondary-button" to="/polls/new">
            New poll
          </Link>
        </div>

        {isLoading && <p className="helper-text">Loading polls...</p>}

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        {!isLoading && polls.length === 0 && (
          <p className="helper-text">
            No polls yet. Create your first poll to start collecting feedback.
          </p>
        )}

        <div className="poll-list">
          {polls.map((poll) => (
            <article className="poll-list-item" key={poll.id}>
              <div>
                <div className="poll-title-row">
                  <h3>{poll.title}</h3>
                  <span className={`status-pill status-${poll.status}`}>
                    {poll.status}
                  </span>
                </div>

                <p className="helper-text">
                  {poll.description || "No description"}
                </p>

                <div className="poll-meta">
                  <span>{poll.responseMode}</span>
                  <span>{poll.questionCount} questions</span>
                  <span>
                    Expires: {new Date(poll.expiresAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="poll-actions">
                <button
                  className="small-ghost-button"
                  type="button"
                  onClick={() => copyPollLink(poll.slug)}
                >
                  Copy link
                </button>

                <Link className="small-ghost-button" to={`/polls/${poll.id}/analytics`}>
                    Analytics
                  </Link>
                <Link className="small-ghost-button" to={`/polls/${poll.slug}`}>
                  
                  Open
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
