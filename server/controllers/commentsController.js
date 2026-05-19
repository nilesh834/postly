import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { success, error } from "../utils/responseWrapper.js";
import { normalizeId } from "../utils/idUtils.js";

export const createCommentController = async (req, res) => {
  try {
    const { postId, text } = req.body;

    if (!postId || !text?.trim()) {
      return res
        .status(400)
        .send(error(400, "Post ID and comment text are required"));
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send(error(404, "Post not found"));
    }

    const comment = await Comment.create({
      owner: req._id,
      post: postId,
      text: text.trim(),
    });

    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "owner",
    );

    return res.status(201).send(
      success(201, {
        comment: {
          _id: normalizeId(populatedComment._id),
          text: populatedComment.text,
          createdAt: populatedComment.createdAt,
          owner: {
            _id: normalizeId(populatedComment.owner._id),
            name: populatedComment.owner.name,
            avatar: populatedComment.owner.avatar,
          },
        },
      }),
    );
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const getCommentsController = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("owner")
      .sort({ createdAt: -1 });

    const formattedComments = comments.map((comment) => ({
      _id: normalizeId(comment._id),
      text: comment.text,
      createdAt: comment.createdAt,
      owner: {
        _id: normalizeId(comment.owner._id),
        name: comment.owner.name,
        avatar: comment.owner.avatar,
      },
    }));

    return res.status(200).send(success(200, { comments: formattedComments }));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};

export const deleteCommentController = async (req, res) => {
  try {
    const { commentId } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send(error(404, "Comment not found"));
    }

    if (normalizeId(comment.owner) !== normalizeId(req._id)) {
      return res
        .status(403)
        .send(error(403, "Only owners can delete comments"));
    }

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    await comment.deleteOne();

    return res.status(200).send(success(200, "Comment deleted successfully"));
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
};
