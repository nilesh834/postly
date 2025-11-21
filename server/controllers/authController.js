import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { error, success } from "../utils/responseWrapper.js";

const createAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

export const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).send(error(400, "All fields are required"));
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send(error(409, "User is already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).send(success(201, "User created successfully"));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send(error(400, "All fields are required"));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).send(error(404, "User is not registered"));
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(403).send(error(403, "Incorrect password"));
    }

    const accessToken = createAccessToken({ _id: user._id });

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio ?? null,
      avatar: user.avatar ?? null,
      followers: user.followers ?? [],
      followings: user.followings ?? [],
      posts: user.posts ?? [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).send(success(200, { user: safeUser }));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const logoutController = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).send(success(200, "User logged out"));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};
