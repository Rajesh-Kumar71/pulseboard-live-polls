import Poll from "../models/Poll.js";
import Response from "../models/Response.js";

function validateAnswers(poll, answers) {
  if (!Array.isArray(answers)) {
    return "Answers must be an array";
  }

  const answerMap = new Map();

  for (const answer of answers) {
    if (!answer.questionId || !answer.selectedOptionId) {
      return "Each answer must include questionId and selectedOptionId";
    }

    answerMap.set(String(answer.questionId), String(answer.selectedOptionId));
  }

  for (const question of poll.questions) {
    const questionId = String(question._id);
    const selectedOptionId = answerMap.get(questionId);

    if (question.isRequired && !selectedOptionId) {
      return "Please answer all required questions";
    }

    if (selectedOptionId) {
      const optionExists = question.options.some(
        (option) => String(option._id) === selectedOptionId
      );

      if (!optionExists) {
        return "Selected option does not belong to the question";
      }
    }
  }

  return null;
}

function cleanAnswers(poll, answers) {
  const questionIds = new Set(poll.questions.map((question) => String(question._id)));

  return answers
    .filter((answer) => questionIds.has(String(answer.questionId)))
    .map((answer) => ({
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
    }));
}

export async function submitResponse(req, res) {
  const poll = await Poll.findOne({ slug: req.params.slug });

  if (!poll) {
    return res.status(404).json({
      ok: false,
      message: "Poll not found",
    });
  }

  if (poll.isExpired() || poll.status !== "active") {
    return res.status(403).json({
      ok: false,
      message: "This poll is not accepting responses",
    });
  }

  if (poll.responseMode === "authenticated" && !req.user) {
    return res.status(401).json({
      ok: false,
      message: "Login is required to submit this poll",
    });
  }

  if (poll.responseMode === "authenticated") {
    const existingResponse = await Response.findOne({
      poll: poll._id,
      respondentUser: req.user._id,
    });

    if (existingResponse) {
      return res.status(409).json({
        ok: false,
        message: "You have already submitted this poll",
      });
    }
  }

  const validationError = validateAnswers(poll, req.body.answers);

  if (validationError) {
    return res.status(400).json({
      ok: false,
      message: validationError,
    });
  }

  const response = await Response.create({
    poll: poll._id,
    respondentType:
      poll.responseMode === "authenticated" ? "authenticated" : "anonymous",
    respondentUser:
      poll.responseMode === "authenticated" ? req.user._id : undefined,
    answers: cleanAnswers(poll, req.body.answers),
  });

  const totalResponses = await Response.countDocuments({ poll: poll._id });

  res.status(201).json({
    ok: true,
    message: "Response submitted successfully",
    response: {
      id: response._id,
      respondentType: response.respondentType,
      submittedAt: response.createdAt,
    },
    totalResponses,
  });
}