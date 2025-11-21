import Post from "../models/Post.js";
import User from "../models/User.js";
import { success, error } from "../utils/responseWrapper.js";
import { v2 as cloudinary } from "cloudinary";
import { mapPostOutput } from "../utils/Utils.js";
import { normalizeId } from "../utils/idUtils.js";

export const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const curUserId = req._id;

    if (normalizeId(curUserId) === normalizeId(userIdToFollow)) {
      return res.status(409).send(error(409, "Users cannot follow themselves"));
    }

    const userToFollow = await User.findById(userIdToFollow);
    const curUser = await User.findById(curUserId);

    if (!userToFollow) {
      return res.status(404).send(error(404, "User to follow not found"));
    }
    if (!curUser) {
      return res.status(404).send(error(404, "Current user not found"));
    }

    const curId = normalizeId(curUserId);
    const targetId = normalizeId(userIdToFollow);

    const isFollowing = (curUser.followings || [])
      .map(normalizeId)
      .includes(targetId);

    if (isFollowing) {
      curUser.followings = (curUser.followings || []).filter(
        (id) => normalizeId(id) !== targetId
      );
      userToFollow.followers = (userToFollow.followers || []).filter(
        (id) => normalizeId(id) !== curId
      );
    } else {
      curUser.followings = curUser.followings || [];
      userToFollow.followers = userToFollow.followers || [];

      curUser.followings.push(userIdToFollow);
      userToFollow.followers.push(curUserId);
    }

    await userToFollow.save();
    await curUser.save();

    return res.status(200).send(success(200, { user: userToFollow }));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const getPostsOfFollowing = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId).populate("followings");

    if (!curUser) {
      return res.status(404).send(error(404, "User not found"));
    }

    const fullPosts = await Post.find({
      owner: { $in: curUser.followings },
    }).populate("owner");

    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    const followingsIds = (curUser.followings || []).map((item) =>
      normalizeId(item._id || item)
    );
    followingsIds.push(normalizeId(req._id));

    const suggestions = await User.find({
      _id: { $nin: followingsIds },
    });

    return res
      .status(200)
      .send(success(200, { ...curUser._doc, suggestions, posts }));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    if (!curUser) {
      return res.status(404).send(error(404, "User not found"));
    }

    const userPosts = await Post.find({ owner: curUserId });
    for (const post of userPosts) {
      if (post.image?.publicId) {
        try {
          await cloudinary.uploader.destroy(post.image.publicId);
        } catch (cloudErr) {
          console.error(
            `Failed to destroy Cloudinary image ${post.image.publicId}:`,
            cloudErr
          );
        }
      }
    }

    await Post.deleteMany({ owner: curUserId });

    if (curUser.avatar?.publicId) {
      try {
        await cloudinary.uploader.destroy(curUser.avatar.publicId);
      } catch (cloudErr) {
        console.error(
          `Failed to destroy Cloudinary avatar ${curUser.avatar.publicId}:`,
          cloudErr
        );
      }
    }

    // BULK DB OPERATIONS
    await User.updateMany(
      { followings: curUserId },
      { $pull: { followings: curUserId } }
    );
    await User.updateMany(
      { followers: curUserId },
      { $pull: { followers: curUserId } }
    );
    await Post.updateMany(
      { likes: curUserId },
      { $pull: { likes: curUserId } }
    );

    await User.deleteOne({ _id: curUserId });

    try {
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });
    } catch (cookieErr) {
      console.error(
        "Failed to clear access_token cookie after deleting user:",
        cookieErr
      );
    }

    return res.status(200).send(success(200, "User deleted successfully"));
  } catch (err) {
    console.error("deleteMyProfile error:", err);
    return res.status(500).send(error(500, err.message));
  }
};

export const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    return res.status(200).send(success(200, { user }));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;
    const user = await User.findById(req._id);

    if (!user) {
      return res.status(404).send(error(404, "User not found"));
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).send(error(400, "Name cannot be empty"));
      }
      user.name = name.trim();
    }

    if (bio !== undefined) {
      if (!bio.trim()) {
        return res.status(400).send(error(400, "Bio cannot be empty"));
      }
      user.bio = bio.trim();
    }

    let uploadFailed = false;

    const isDataUrl =
      typeof userImg === "string" && userImg.startsWith("data:");
    if (userImg !== undefined && isDataUrl && userImg !== user.avatar?.url) {
      if (user.avatar?.publicId) {
        try {
          await cloudinary.uploader.destroy(user.avatar.publicId);
        } catch (cloudErr) {
          console.error(
            `Failed to destroy Cloudinary avatar ${user.avatar.publicId}:`,
            cloudErr
          );
        }
      }

      try {
        const cloudImg = await cloudinary.uploader.upload(userImg, {
          folder: "postly/",
        });

        user.avatar = {
          url: cloudImg.secure_url,
          publicId: cloudImg.public_id,
        };
      } catch (cloudErr) {
        console.error("Cloudinary upload failed (profile image):", cloudErr);
        uploadFailed = true;
      }
    }

    await user.save();

    const result = { user };
    if (uploadFailed) {
      return res
        .status(200)
        .send(success(200, { ...result, warning: "Avatar upload failed" }));
    }

    return res.status(200).send(success(200, result));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: { path: "owner" },
    });

    if (!user) {
      return res.status(404).send(error(404, "User not found"));
    }

    const posts = user.posts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();
    return res.status(200).send(success(200, { ...user._doc, posts }));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};
