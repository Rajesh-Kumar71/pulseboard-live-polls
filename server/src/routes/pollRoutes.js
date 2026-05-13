import express from "express";
import {
  createPoll,
  getMyPolls,
  getPollAnalytics,
  getPublicPoll,
  getPublicPollResults,
  publishPollResults,
} from "../controllers/pollController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPoll);
router.get("/my", protect, getMyPolls);
router.get("/:pollId/analytics", protect, getPollAnalytics);
router.patch("/:pollId/publish", protect, publishPollResults);
router.get("/public/:slug/results", getPublicPollResults);
router.get("/public/:slug", getPublicPoll);


export default router;