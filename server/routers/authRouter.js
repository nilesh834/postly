import { Router } from "express";
import {
  signupController,
  loginController,
  logoutController,
  refreshAccessTokenController,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/refresh", refreshAccessTokenController);
router.post("/logout", logoutController);

export default router;
