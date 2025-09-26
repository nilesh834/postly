import React, { useState } from "react";
import Avatar from "../avatar/Avatar";
import "./Post.scss";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { likeAndUnlikePost } from "../../redux/slices/postsSlice";
import { useNavigate } from "react-router";
import { showToast } from "../../redux/slices/appConfigSlice";
import { TOAST_SUCCESS, TOAST_FAILURE } from "../../App";

function Post({ post }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handlePostLiked() {
    if (loading) return;
    setLoading(true);

    try {
      await dispatch(
        likeAndUnlikePost({
          postId: post._id,
        })
      ).unwrap();

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: post.isLiked ? "Unliked post." : "Liked post ❤️",
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Failed to like/unlike post. Try again.",
        })
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="Post">
      <div
        className="heading"
        onClick={() => navigate(`/profile/${post.owner._id}`)}
      >
        <Avatar src={post.owner?.avatar?.url} />
        <h4>{post.owner?.name}</h4>
      </div>
      <div className="content">
        <img src={post?.image?.url} alt={`Post by ${post.owner?.name}`} />
      </div>
      <div className="footer">
        <div
          className="like"
          onClick={handlePostLiked}
          style={{
            opacity: loading ? 0.6 : 1,
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          {post.isLiked ? (
            <AiFillHeart style={{ color: "red" }} className="icon" />
          ) : (
            <AiOutlineHeart className="icon" />
          )}
          <h4>{`${post.likesCount} likes`}</h4>
        </div>
        <p className="caption">{post.caption}</p>
        <h6 className="time-ago">{post?.timeAgo}</h6>
      </div>
    </div>
  );
}

export default Post;
