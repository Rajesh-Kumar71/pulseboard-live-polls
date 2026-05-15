import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PublicResults from "./PublicResults";
import socket from "../sockets/socket";

function PublicPoll() {
  const { slug } = useParams();
  const { isLoggedIn } = useAuth();

  const [poll, setPoll] = useState(null);
  const [publishedResults, setPublishedResults] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [totalResponses, setTotalResponses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveResponseCount, setLiveResponseCount] = useState(null);

  useEffect(() => {
    async function loadPoll() {
      try {
        const response = await api.get(`/api/polls/public/${slug}`);
        const publicPoll = response.data.poll;

        setPoll(publicPoll);

        if (publicPoll.isPublished) {
          const resultsResponse = await api.get(
            `/api/polls/public/${slug}/results`,
          );
          setPublishedResults(resultsResponse.data.results);
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Unable to load poll");
      } finally {
        setIsLoading(false);
      }
    }

    loadPoll();
  }, [slug]);

  useEffect(() => {
    if (!poll?.id) {
      return;
    }

    socket.connect();
    socket.emit("poll:join", poll.id);

    function handleResponseSubmitted(event) {
      if (event.pollId === poll.id) {
        setLiveResponseCount(event.totalResponses);
      }
    }

    socket.on("poll:response-submitted", handleResponseSubmitted);

    return () => {
      socket.off("poll:response-submitted", handleResponseSubmitted);
      socket.disconnect();
    };
  }, [poll?.id]);

  function handleOptionChange(questionId, optionId) {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }

  function validateAnswers() {
    for (const question of poll.questions) {
      if (question.isRequired && !answers[question._id]) {
        return "Please answer all required questions";
      }
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateAnswers();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload = {
      answers: Object.entries(answers).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        }),
      ),
    };

    try {
      setIsSubmitting(true);

      const response = await api.post(`/api/responses/${slug}`, payload);

      setSuccessMessage(response.data.message);
      setTotalResponses(response.data.totalResponses);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to submit response",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <p className="eyebrow">PulseBoard</p>
          <h2>Loading poll...</h2>
        </section>
      </main>
    );
  }

  if (publishedResults) {
    return <PublicResults results={publishedResults} />;
  }

  if (!poll) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <p className="eyebrow">Poll not found</p>
          <h2>{errorMessage}</h2>
          <Link className="secondary-button" to="/">
            Go home
          </Link>
        </section>
      </main>
    );
  }

  const isExpired = poll.status === "expired";
  const needsLogin = poll.responseMode === "authenticated" && !isLoggedIn;

  return (
    <main className="public-poll-shell">
      <section className="public-poll-card">
        <div className="public-poll-header">
          <div>
            <p className="eyebrow">PulseBoard poll</p>
            <h1>{poll.title}</h1>
            {poll.description && <p className="subtitle">{poll.description}</p>}
          </div>

          <span className={`status-pill status-${poll.status}`}>
            {poll.status}
          </span>
        </div>

        <div className="poll-meta public-meta">
          <span>{poll.responseMode} responses</span>
          <span>Expires: {new Date(poll.expiresAt).toLocaleString()}</span>
          <span className="live-pill">Live updates on</span>
        </div>

        {isExpired && (
          <p className="form-error">
            This poll has expired and is no longer accepting responses.
          </p>
        )}

        {needsLogin && (
          <section className="success-card">
            <p className="eyebrow">Login required</p>
            <h3>This poll accepts authenticated responses only.</h3>
            <p className="helper-text">
              Please login before submitting your feedback.
            </p>
            <Link className="primary-button" to="/login">
              Login to respond
            </Link>
          </section>
        )}

        {!poll.isPublished && !isExpired && !needsLogin && !successMessage && (
          <form className="public-response-form" onSubmit={handleSubmit}>
            {poll.questions.map((question, questionIndex) => (
              <section className="question-card" key={question._id}>
                <div className="question-title-row">
                  <h3>
                    {questionIndex + 1}. {question.text}
                  </h3>

                  <span className="question-tag">
                    {question.isRequired ? "Required" : "Optional"}
                  </span>
                </div>

                <div className="public-options">
                  {question.options.map((option) => (
                    <label className="public-option" key={option._id}>
                      <input
                        type="radio"
                        name={question._id}
                        value={option._id}
                        checked={answers[question._id] === option._id}
                        onChange={() =>
                          handleOptionChange(question._id, option._id)
                        }
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>
              </section>
            ))}

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit feedback"}
            </button>
          </form>
        )}

        {successMessage && (
          <section className="success-card">
            <p className="eyebrow">Submitted</p>
            <h3>{successMessage}</h3>
            {(liveResponseCount !== null || totalResponses !== null) && (
              <p className="helper-text">
                Total responses collected: {liveResponseCount ?? totalResponses}
              </p>
            )}
            <Link className="secondary-button" to="/">
              Back to home
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}

export default PublicPoll;
