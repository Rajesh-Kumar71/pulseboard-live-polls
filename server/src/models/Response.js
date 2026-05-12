import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const responseSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
      index: true,
    },
    respondentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    respondentType: {
      type: String,
      enum: ["anonymous", "authenticated"],
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

responseSchema.index(
  { poll: 1, respondentUser: 1 },
  {
    unique: true,
    partialFilterExpression: {
      respondentUser: { $exists: true },
    },
  }
);

const Response = mongoose.model("Response", responseSchema);

export default Response;