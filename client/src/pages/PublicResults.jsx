import { Link } from "react-router-dom";

function PublicResults({ results }) {
  const { poll, totalResponses, participation, questions } = results;

  return (
    <main className="public-poll-shell">
      <section className="public-poll-card">
        <div className="public-poll-header">
          <div>
            <p className="eyebrow">Final results</p>
            <h1>{poll.title}</h1>
            {poll.description && <p className="subtitle">{poll.description}</p>}
          </div>

          <span className="status-pill status-published">published</span>
        </div>

        <div className="dashboard-grid public-results-grid">
          <article className="dashboard-card">
            <span className="metric-value">{totalResponses}</span>
            <p className="metric-label">Total responses</p>
          </article>

          <article className="dashboard-card">
            <span className="metric-value">{participation.anonymousResponses}</span>
            <p className="metric-label">Anonymous</p>
          </article>

          <article className="dashboard-card">
            <span className="metric-value">
              {participation.authenticatedResponses}
            </span>
            <p className="metric-label">Authenticated</p>
          </article>
        </div>

        <section className="analytics-list">
          {questions.map((question, index) => (
            <article
              className="dashboard-card analytics-question"
              key={question.questionId}
            >
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

        <div className="hero-actions">
          <Link className="secondary-button" to="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default PublicResults;