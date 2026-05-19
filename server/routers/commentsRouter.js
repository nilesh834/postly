import { Router } from "express";

import requireUser from "../middlewares/requireUser.js";

import {
  createCommentController,
  getCommentsController,
  deleteCommentController,
} from "../controllers/commentsController.js";

const router = Router();

// Create comment
router.post("/", requireUser, createCommentController);

// Get comments for a post
router.get("/:postId", requireUser, getCommentsController);

// Delete comment
router.delete("/", requireUser, deleteCommentController);

export default router;
