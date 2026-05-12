import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Option text is required"],
      trim: true,
      minlength: 1,
      maxlength: 160,
    },
  },
  {
    _id: true,
  }
);

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      minlength: 3,
      maxlength: 300,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    options: {
      type: [optionSchema],
      validate: {
        validator(options) {
          return Array.isArray(options) && options.length >= 2;
        },
        message: "Each question must have at least two options",
      },
    },
  },
  {
    _id: true,
  }
);

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Poll title is required"],
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 600,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    responseMode: {
      type: String,
      enum: ["anonymous", "authenticated"],
      default: "anonymous",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required"],
    },
    status: {
      type: String,
      enum: ["active", "expired", "published"],
      default: "active",
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator(questions) {
          return Array.isArray(questions) && questions.length >= 1;
        },
        message: "Poll must have at least one question",
      },
    },
  },
  {
    timestamps: true,
  }
);

pollSchema.methods.isExpired = function isExpired() {
  return new Date() >= this.expiresAt;
};

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;