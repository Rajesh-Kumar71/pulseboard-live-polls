import express from "express";
import { optionalProtect } from "../middleware/authMiddleware.js";
import { submitResponse } from "../controllers/responseController.js";

const router = express.Router();

router.post("/:slug", optionalProtect, submitResponse);

export default router;