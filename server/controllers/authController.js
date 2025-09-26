const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.send(error(400, "All fields are required"));
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.send(error(409, "User is already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.send(success(201, "user created successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send(error(400, "All fields are required"));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.send(error(404, "User is not registered"));
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.send(error(403, "Incorrect password")); // ✅ fixed typo
    }

    const accessToken = generateAccessToken({ _id: user._id });
    const refreshToken = generateRefreshToken({ _id: user._id });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(200, { accessToken }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.send(error(401, "Refresh token in cookie is required"));
  }

  const refreshToken = cookies.jwt;

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const accessToken = generateAccessToken({ _id: decoded._id });

    return res.send(success(201, { accessToken }));
  } catch (err) {
    return res.send(error(401, "Invalid refresh token"));
  }
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "user logged out"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

// internal functions
const generateAccessToken = (data) =>
  jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, { expiresIn: "1d" });

const generateRefreshToken = (data) =>
  jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, { expiresIn: "1y" });

module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  logoutController,
};

