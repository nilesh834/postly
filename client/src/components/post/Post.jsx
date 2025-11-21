import React, { useState } from "react";
import Avatar from "../avatar/Avatar";
import "./Post.scss";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import {
  likeAndUnlikePost,
  updatePost,
  deletePost,
} from "../../redux/slices/postsSlice";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../redux/slices/appConfigSlice";
import { TOAST_SUCCESS, TOAST_FAILURE } from "../../utils/constants";

function Post({ post }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [likeLoading, setLikeLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption || "");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const isMyPost = myProfile?._id === post.owner._id;

  // Like & Unlike
  async function handlePostLiked() {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await dispatch(likeAndUnlikePost({ postId: post._id })).unwrap();
      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: post.isLiked ? "Unliked post." : "Liked post ❤️",
        })
      );
    } finally {
      setLikeLoading(false);
    }
  }

  // Enter edit mode
  function handleStartEdit(e) {
    e.stopPropagation();
    setEditedCaption(post.caption || "");
    setIsEditing(true);
  }

  // Cancel edit
  function handleCancelEdit(e) {
    e?.stopPropagation?.();
    setIsEditing(false);
    setEditedCaption(post.caption || "");
  }

  // Save edited caption
  async function handleSaveEdit(e) {
    e.stopPropagation();

    const trimmed = editedCaption.trim();
    if (!trimmed) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Caption cannot be empty.",
        })
      );
      return;
    }

    // If caption didn't change, just cancel edit
    if (trimmed === post.caption) {
      setIsEditing(false);
      return;
    }

    if (editLoading) return;
    setEditLoading(true);

    try {
      await dispatch(
        updatePost({ postId: post._id, caption: trimmed })
      ).unwrap();

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: "Post updated successfully.",
        })
      );
      setIsEditing(false);
    } catch (err) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Failed to update post.",
        })
      );
    } finally {
      setEditLoading(false);
    }
  }

  // Open delete modal
  function handleOpenDeleteModal(e) {
    e.stopPropagation();
    setShowDeleteModal(true);
  }

  // Confirm delete
  async function handleConfirmDelete() {
    if (deleteLoading) return;
    setDeleteLoading(true);

    try {
      await dispatch(deletePost({ postId: post._id })).unwrap();

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: "Post deleted successfully.",
        })
      );
      setShowDeleteModal(false);
    } catch (err) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Failed to delete post.",
        })
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  // Cancel delete
  function handleCancelDelete() {
    setShowDeleteModal(false);
  }

  return (
    <div className="Post">
      <div
        className="heading"
        onClick={() => navigate(`/profile/${post.owner._id}`)}
      >
        <Avatar src={post.owner?.avatar?.url} />
        <h4>{post.owner?.name}</h4>

        {isMyPost && (
          <div className="post-actions">
            {!isEditing && (
              <>
                <button
                  type="button"
                  className="post-action-btn"
                  onClick={handleStartEdit}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="post-action-btn delete"
                  onClick={handleOpenDeleteModal}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="content">
        <img src={post?.image?.url} alt={`Post by ${post.owner?.name}`} />
      </div>

      <div className="footer">
        <div
          className="like"
          onClick={handlePostLiked}
          style={{
            opacity: likeLoading ? 0.6 : 1,
            pointerEvents: likeLoading ? "none" : "auto",
          }}
        >
          {post.isLiked ? (
            <AiFillHeart style={{ color: "red" }} className="icon" />
          ) : (
            <AiOutlineHeart className="icon" />
          )}
          <h4>{`${post.likesCount} likes`}</h4>
        </div>

        {isEditing ? (
          <div className="edit-caption">
            <input
              type="text"
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              placeholder="Edit caption"
            />
            <div className="edit-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveEdit}
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelEdit}
                disabled={editLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="caption">{post.caption}</p>
        )}

        <h6 className="time-ago">{post?.timeAgo}</h6>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Post?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
