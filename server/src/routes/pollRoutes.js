import express from "express";
import {
  createPoll,
  getMyPolls,
  getPublicPoll,
} from "../controllers/pollController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPoll);
router.get("/my", protect, getMyPolls);
router.get("/public/:slug", getPublicPoll);

export default router;