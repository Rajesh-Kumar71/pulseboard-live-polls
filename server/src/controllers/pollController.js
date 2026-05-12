import Poll from "../models/Poll.js";
import { createSlug } from "../utils/createSlug.js";

function cleanQuestion(question) {
  return {
    _id: question._id,
    text: question.text,
    isRequired: question.isRequired,
    options: question.options.map((option) => ({
      _id: option._id,
      text: option.text,
    })),
  };
}

function getSafePublicPoll(poll) {
  return {
    id: poll._id,
    title: poll.title,
    description: poll.description,
    slug: poll.slug,
    responseMode: poll.responseMode,
    expiresAt: poll.expiresAt,
    status: poll.isExpired() ? "expired" : poll.status,
    isPublished: poll.isPublished,
    questions: poll.questions.map(cleanQuestion),
  };
}

function validatePollPayload({ title, questions, expiresAt, responseMode }) {
  if (!title || title.trim().length < 3) {
    return "Poll title must be at least 3 characters";
  }

  if (!["anonymous", "authenticated"].includes(responseMode)) {
    return "Response mode must be anonymous or authenticated";
  }

  const expiryDate = new Date(expiresAt);

  if (!expiresAt || Number.isNaN(expiryDate.getTime())) {
    return "Valid expiry time is required";
  }

  if (expiryDate <= new Date()) {
    return "Expiry time must be in the future";
  }

  if (!Array.isArray(questions) || questions.length < 1) {
    return "Poll must have at least one question";
  }

  for (const question of questions) {
    if (!question.text || question.text.trim().length < 3) {
      return "Each question must have at least 3 characters";
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      return "Each question must have at least two options";
    }

    for (const option of question.options) {
      if (!option.text || option.text.trim().length < 1) {
        return "Option text cannot be empty";
      }
    }
  }

  return null;
}

export async function createPoll(req, res) {
  const {
    title,
    description = "",
    responseMode = "anonymous",
    expiresAt,
    questions,
  } = req.body;

  const validationError = validatePollPayload({
    title,
    questions,
    expiresAt,
    responseMode,
  });

  if (validationError) {
    return res.status(400).json({
      ok: false,
      message: validationError,
    });
  }

  const poll = await Poll.create({
    title: title.trim(),
    description: description.trim(),
    responseMode,
    expiresAt,
    questions,
    slug: createSlug(title),
    creator: req.user._id,
  });

  res.status(201).json({
    ok: true,
    poll: {
      id: poll._id,
      title: poll.title,
      description: poll.description,
      slug: poll.slug,
      responseMode: poll.responseMode,
      expiresAt: poll.expiresAt,
      status: poll.status,
      isPublished: poll.isPublished,
      questions: poll.questions,
      createdAt: poll.createdAt,
    },
  });
}

export async function getMyPolls(req, res) {
  const polls = await Poll.find({ creator: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  const now = new Date();

  res.status(200).json({
    ok: true,
    polls: polls.map((poll) => ({
      id: poll._id,
      title: poll.title,
      description: poll.description,
      slug: poll.slug,
      responseMode: poll.responseMode,
      expiresAt: poll.expiresAt,
      status: now >= poll.expiresAt ? "expired" : poll.status,
      isPublished: poll.isPublished,
      questionCount: poll.questions.length,
      createdAt: poll.createdAt,
    })),
  });
}

export async function getPublicPoll(req, res) {
  const poll = await Poll.findOne({ slug: req.params.slug });

  if (!poll) {
    return res.status(404).json({
      ok: false,
      message: "Poll not found",
    });
  }

  res.status(200).json({
    ok: true,
    poll: getSafePublicPoll(poll),
  });
}
