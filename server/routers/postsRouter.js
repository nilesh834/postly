import { Router } from "express";
import {
  createPostController,
  likeAndUnlikePost,
  updatePostController,
  deletePost,
} from "../controllers/postsController.js";
import requireUser from "../middlewares/requireUser.js";

const router = Router();

router.post("/", requireUser, createPostController);
router.post("/like", requireUser, likeAndUnlikePost);
router.put("/", requireUser, updatePostController);
router.delete("/", requireUser, deletePost);

export default router;
