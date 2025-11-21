import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { error } from "../utils/responseWrapper.js";

const requireUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.access_token;
    if (!accessToken) {
      return res.status(401).send(error(401, "Authentication required"));
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        return res
          .status(401)
          .send(error(401, "Token expired. Please log in again."));
      }
      return res.status(401).send(error(401, "Invalid token"));
    }

    req._id = decoded._id;
    const user = await User.findById(req._id).select("-password");
    if (!user) {
      return res.status(404).send(error(404, "User not found"));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("requireUser error:", err);
    return res.status(500).send(error(500, "Internal Server Error"));
  }
};

export default requireUser;
