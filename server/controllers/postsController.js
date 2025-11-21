import Post from "../models/Post.js";
import User from "../models/User.js";
import { success, error } from "../utils/responseWrapper.js";
import { v2 as cloudinary } from "cloudinary";
import { mapPostOutput } from "../utils/Utils.js";
import { normalizeId } from "../utils/idUtils.js";

export const createPostController = async (req, res) => {
  try {
    const { caption, postImg } = req.body;
    if (!caption || !postImg) {
      return res
        .status(400)
        .send(
          error(400, "Both caption and image are required to create a post")
        );
    }

    let cloudImg;
    try {
      cloudImg = await cloudinary.uploader.upload(postImg, {
        folder: "postly/",
      });
    } catch (cloudErr) {
      console.error("Cloudinary upload failed:", cloudErr);
      return res
        .status(502)
        .send(error(502, "Failed to upload image to Cloudinary"));
    }

    const owner = req._id;
    const user = await User.findById(req._id);

    const post = await Post.create({
      owner,
      caption,
      image: { publicId: cloudImg.public_id, url: cloudImg.secure_url },
    });

    user.posts.push(post._id);
    await user.save();

    const createdPost = await Post.findById(post._id)
      .populate("owner")
      .populate("likes");
    return res
      .status(200)
      .send(success(200, { post: mapPostOutput(createdPost, req._id) }));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const likeAndUnlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId).populate("owner");
    if (!post) {
      return res.status(404).send(error(404, "Post not found"));
    }

    const curId = normalizeId(curUserId);
    const likesArr = (post.likes || []).map(normalizeId);

    if (likesArr.includes(curId)) {
      post.likes = (post.likes || []).filter((l) => normalizeId(l) !== curId);
    } else {
      post.likes.push(curUserId);
    }

    await post.save();
    return res
      .status(200)
      .send(success(200, { post: mapPostOutput(post, req._id) }));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const updatePostController = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send(error(404, "Post not found"));
    }

    if (normalizeId(post.owner) !== normalizeId(curUserId)) {
      return res
        .status(403)
        .send(error(403, "Only owners can update their posts"));
    }

    if (caption !== undefined && caption !== null) {
      post.caption = caption;
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("owner")
      .populate("likes");
    return res
      .status(200)
      .send(success(200, { post: mapPostOutput(updatedPost, req._id) }));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId);
    const curUser = await User.findById(curUserId);

    if (!post) {
      return res.status(404).send(error(404, "Post not found"));
    }

    if (normalizeId(post.owner) !== normalizeId(curUserId)) {
      return res
        .status(403)
        .send(error(403, "Only owners can delete their posts"));
    }

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

    if (curUser) {
      curUser.posts = (curUser.posts || []).filter(
        (p) => normalizeId(p) !== normalizeId(postId)
      );
      await curUser.save();
    }

    await post.deleteOne();
    return res.status(200).send(success(200, "Post deleted successfully"));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};
