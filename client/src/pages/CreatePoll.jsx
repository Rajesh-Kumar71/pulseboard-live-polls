import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreatePoll() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    responseMode: "anonymous",
    expiresAt: "",
    questions: [
      {
        text: "",
        isRequired: true,
        options: [{ text: "" }, { text: "" }],
      },
    ],
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [createdPoll, setCreatedPoll] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name, value) {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateQuestion(questionIndex, field, value) {
    setFormData((current) => {
      const questions = [...current.questions];
      questions[questionIndex] = {
        ...questions[questionIndex],
        [field]: value,
      };

      return {
        ...current,
        questions,
      };
    });
  }

  function updateOption(questionIndex, optionIndex, value) {
    setFormData((current) => {
      const questions = [...current.questions];
      const options = [...questions[questionIndex].options];

      options[optionIndex] = { text: value };
      questions[questionIndex] = {
        ...questions[questionIndex],
        options,
      };

      return {
        ...current,
        questions,
      };
    });
  }

  function addQuestion() {
    setFormData((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          text: "",
          isRequired: true,
          options: [{ text: "" }, { text: "" }],
        },
      ],
    }));
  }

  function removeQuestion(questionIndex) {
    setFormData((current) => {
      if (current.questions.length === 1) {
        return current;
      }

      return {
        ...current,
        questions: current.questions.filter((_, index) => index !== questionIndex),
      };
    });
  }

  function addOption(questionIndex) {
    setFormData((current) => {
      const questions = [...current.questions];

      questions[questionIndex] = {
        ...questions[questionIndex],
        options: [...questions[questionIndex].options, { text: "" }],
      };

      return {
        ...current,
        questions,
      };
    });
  }

  function removeOption(questionIndex, optionIndex) {
    setFormData((current) => {
      const questions = [...current.questions];
      const options = questions[questionIndex].options;

      if (options.length === 2) {
        return current;
      }

      questions[questionIndex] = {
        ...questions[questionIndex],
        options: options.filter((_, index) => index !== optionIndex),
      };

      return {
        ...current,
        questions,
      };
    });
  }

  function validateForm() {
    if (formData.title.trim().length < 3) {
      return "Poll title must be at least 3 characters";
    }

    if (!formData.expiresAt) {
      return "Expiry date and time is required";
    }

    if (new Date(formData.expiresAt) <= new Date()) {
      return "Expiry date and time must be in the future";
    }

    for (const question of formData.questions) {
      if (question.text.trim().length < 3) {
        return "Each question must have at least 3 characters";
      }

      const filledOptions = question.options.filter(
        (option) => option.text.trim().length > 0
      );

      if (filledOptions.length < 2) {
        return "Each question must have at least two options";
      }
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setCreatedPoll(null);

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      expiresAt: new Date(formData.expiresAt).toISOString(),
      questions: formData.questions.map((question) => ({
        text: question.text.trim(),
        isRequired: question.isRequired,
        options: question.options
          .filter((option) => option.text.trim())
          .map((option) => ({ text: option.text.trim() })),
      })),
    };

    try {
      setIsSubmitting(true);

      const response = await api.post("/api/polls", payload);
      setCreatedPoll(response.data.poll);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to create poll");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyPollLink() {
    if (!createdPoll) return;

    const pollLink = `${window.location.origin}/polls/${createdPoll.slug}`;
    await navigator.clipboard.writeText(pollLink);
  }

  return (
    <main className="dashboard-shell">
      <nav className="topbar">
        <div>
          <p className="eyebrow">Create poll</p>
          <h2>Build a feedback poll</h2>
        </div>

        <Link className="ghost-button" to="/dashboard">
          Back to dashboard
        </Link>
      </nav>

      <form className="poll-form" onSubmit={handleSubmit}>
        <section className="dashboard-card form-section">
          <h3>Poll details</h3>

          <label>
            Poll title
            <input
              type="text"
              value={formData.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Web Dev Cohort Feedback"
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={formData.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Tell respondents what this poll is about"
              rows="3"
            />
          </label>

          <div className="two-column">
            <label>
              Response mode
              <select
                value={formData.responseMode}
                onChange={(event) =>
                  updateField("responseMode", event.target.value)
                }
              >
                <option value="anonymous">Anonymous</option>
                <option value="authenticated">Authenticated</option>
              </select>
            </label>

            <label>
              Expiry date and time
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(event) =>
                  updateField("expiresAt", event.target.value)
                }
                required
              />
            </label>
          </div>

          <p className="helper-text">
            Anonymous polls can be answered by anyone with the link.
            Authenticated polls require login before submission.
          </p>
        </section>

        {formData.questions.map((question, questionIndex) => (
          <section className="dashboard-card form-section" key={questionIndex}>
            <div className="question-header">
              <h3>Question {questionIndex + 1}</h3>

              <button
                className="small-danger-button"
                type="button"
                onClick={() => removeQuestion(questionIndex)}
                disabled={formData.questions.length === 1}
              >
                Remove
              </button>
            </div>

            <label>
              Question text
              <input
                type="text"
                value={question.text}
                onChange={(event) =>
                  updateQuestion(questionIndex, "text", event.target.value)
                }
                placeholder="How was today's session?"
                required
              />
            </label>

            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={question.isRequired}
                onChange={(event) =>
                  updateQuestion(
                    questionIndex,
                    "isRequired",
                    event.target.checked
                  )
                }
              />
              Required question
            </label>

            <div className="options-list">
              {question.options.map((option, optionIndex) => (
                <div className="option-row" key={optionIndex}>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(event) =>
                      updateOption(
                        questionIndex,
                        optionIndex,
                        event.target.value
                      )
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                    required={optionIndex < 2}
                  />

                  <button
                    className="small-ghost-button"
                    type="button"
                    onClick={() => removeOption(questionIndex, optionIndex)}
                    disabled={question.options.length === 2}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              className="secondary-button"
              type="button"
              onClick={() => addOption(questionIndex)}
            >
              Add option
            </button>
          </section>
        ))}

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        {createdPoll && (
          <section className="success-card">
            <p className="eyebrow">Poll created</p>
            <h3>{createdPoll.title}</h3>
            <p className="helper-text">
              Public link: {window.location.origin}/polls/{createdPoll.slug}
            </p>

            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={copyPollLink}>
                Copy poll link
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={() => navigate("/dashboard")}
              >
                Go to dashboard
              </button>
            </div>
          </section>
        )}

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={addQuestion}>
            Add question
          </button>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating poll..." : "Create poll"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default CreatePoll;