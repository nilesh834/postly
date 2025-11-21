import { Router } from "express";
import requireUser from "../middlewares/requireUser.js";
import {
  followOrUnfollowUserController,
  getPostsOfFollowing,
  deleteMyProfile,
  getMyInfo,
  updateUserProfile,
  getUserProfile,
} from "../controllers/userController.js";

const router = Router();

router.post("/follow", requireUser, followOrUnfollowUserController);
router.get("/getFeedData", requireUser, getPostsOfFollowing);
router.delete("/", requireUser, deleteMyProfile);
router.get("/getMyInfo", requireUser, getMyInfo);

router.put("/", requireUser, updateUserProfile);
router.post("/getUserProfile", requireUser, getUserProfile);

export default router;
