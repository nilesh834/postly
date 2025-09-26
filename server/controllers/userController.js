const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;
const { mapPostOutput } = require("../utils/Utils");

const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const curUserId = req._id;

    const userToFollow = await User.findById(userIdToFollow);
    const curUser = await User.findById(curUserId);

    if (curUserId === userIdToFollow) {
      return res.send(error(409, "Users cannot follow themselves"));
    }

    if (!userToFollow) {
      return res.send(error(404, "User to follow not found"));
    }

    if (curUser.followings.includes(userIdToFollow)) {
      const followingIndex = curUser.followings.indexOf(userIdToFollow);
      curUser.followings.splice(followingIndex, 1);

      const followerIndex = userToFollow.followers.indexOf(curUserId);
      userToFollow.followers.splice(followerIndex, 1);
    } else {
      userToFollow.followers.push(curUserId);
      curUser.followings.push(userIdToFollow);
    }

    await userToFollow.save();
    await curUser.save();

    return res.send(success(200, { user: userToFollow }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getPostsOfFollowing = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId).populate("followings");

    const fullPosts = await Post.find({
      owner: { $in: curUser.followings },
    }).populate("owner");

    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    const followingsIds = curUser.followings.map((item) => item._id);
    followingsIds.push(req._id);

    const suggestions = await User.find({
      _id: { $nin: followingsIds },
    });

    return res.send(success(200, { ...curUser._doc, suggestions, posts }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getMyPosts = async (req, res) => {
  try {
    const curUserId = req._id;
    const allUserPosts = await Post.find({ owner: curUserId }).populate(
      "likes"
    );

    return res.send(success(200, { allUserPosts }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.send(error(400, "userId is required"));
    }

    const allUserPosts = await Post.find({ owner: userId }).populate("likes");

    return res.send(success(200, { allUserPosts }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    if (!curUser) {
      return res.send(error(404, "User not found"));
    }

    await Post.deleteMany({ owner: curUserId });

    for (const followerId of curUser.followers) {
      const follower = await User.findById(followerId);
      if (!follower) continue;
      follower.followings = follower.followings.filter(
        (id) => id.toString() !== curUserId.toString()
      );
      await follower.save();
    }

    for (const followingId of curUser.followings) {
      const following = await User.findById(followingId);
      if (!following) continue;
      following.followers = following.followers.filter(
        (id) => id.toString() !== curUserId.toString()
      );
      await following.save();
    }

    const allPosts = await Post.find();
    for (const post of allPosts) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== curUserId.toString()
      );
      await post.save();
    }

    await User.deleteOne({ _id: curUserId });

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.send(success(200, "User deleted"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    return res.send(success(200, { user }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;

    const user = await User.findById(req._id);

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (userImg) {
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "profileImg",
      });
      user.avatar = {
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id,
      };
    }
    await user.save();
    return res.send(success(200, { user }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: { path: "owner" },
    });

    const posts = user.posts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    return res.send(success(200, { ...user._doc, posts }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

module.exports = {
  followOrUnfollowUserController,
  getPostsOfFollowing,
  getMyPosts,
  getUserPosts,
  deleteMyProfile,
  getMyInfo,
  updateUserProfile,
  getUserProfile,
};
