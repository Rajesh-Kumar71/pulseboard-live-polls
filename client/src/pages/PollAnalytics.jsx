import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

function PollAnalytics() {
  const { pollId } = useParams();

  const [analytics, setAnalytics] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await api.get(`/api/polls/${pollId}/analytics`);
        setAnalytics(response.data.analytics);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Unable to load analytics"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [pollId]);

  if (isLoading) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <p className="eyebrow">Analytics</p>
          <h2>Loading poll analytics...</h2>
        </section>
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <p className="eyebrow">Analytics unavailable</p>
          <h2>{errorMessage}</h2>
          <Link className="secondary-button" to="/dashboard">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  const { poll, totalResponses, participation, questions } = analytics;

  return (
    <main className="dashboard-shell">
      <nav className="topbar">
        <div>
          <p className="eyebrow">Poll analytics</p>
          <h2>{poll.title}</h2>
        </div>

        <Link className="ghost-button" to="/dashboard">
          Back to dashboard
        </Link>
      </nav>

      <section className="dashboard-grid">
        <article className="dashboard-card wide-card">
          <div className="poll-title-row">
            <div>
              <p className="eyebrow">Overview</p>
              <h1>{poll.title}</h1>
              {poll.description && <p className="subtitle">{poll.description}</p>}
            </div>

            <span className={`status-pill status-${poll.status}`}>
              {poll.status}
            </span>
          </div>

          <div className="poll-meta">
            <span>{poll.responseMode} responses</span>
            <span>{poll.questionCount} questions</span>
            <span>Expires: {new Date(poll.expiresAt).toLocaleString()}</span>
          </div>
        </article>

        <article className="dashboard-card">
          <span className="metric-value">{totalResponses}</span>
          <p className="metric-label">Total responses</p>
        </article>

        <article className="dashboard-card">
          <span className="metric-value">{participation.anonymousResponses}</span>
          <p className="metric-label">Anonymous responses</p>
        </article>

        <article className="dashboard-card">
          <span className="metric-value">
            {participation.authenticatedResponses}
          </span>
          <p className="metric-label">Authenticated responses</p>
        </article>
      </section>

      <section className="analytics-list">
        {questions.map((question, index) => (
          <article className="dashboard-card analytics-question" key={question.questionId}>
            <div className="question-title-row">
              <div>
                <p className="eyebrow">Question {index + 1}</p>
                <h3>{question.text}</h3>
              </div>

              <span className="question-tag">
                {question.isRequired ? "Required" : "Optional"}
              </span>
            </div>

            <div className="poll-meta">
              <span>Answered: {question.answeredCount}</span>
              <span>Skipped: {question.skippedCount}</span>
            </div>

            <div className="analytics-options">
              {question.options.map((option) => (
                <div className="analytics-option" key={option.optionId}>
                  <div className="analytics-option-top">
                    <span>{option.text}</span>
                    <strong>
                      {option.count} votes · {option.percentage}%
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${option.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default PollAnalytics;