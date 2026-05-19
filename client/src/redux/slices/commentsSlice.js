import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";

// Fetch comments for a post
export const getComments = createAsyncThunk(
  "comments/getComments",
  async (postId) => {
    const response = await axiosClient.get(`/comments/${postId}`);
    return {
      postId,
      comments: response.result.comments,
    };
  },
);

// Create comment
export const createComment = createAsyncThunk(
  "comments/createComment",
  async ({ postId, text }) => {
    const response = await axiosClient.post("/comments", {
      postId,
      text,
    });

    return {
      postId,
      comment: response.result.comment,
    };
  },
);

// Delete comment
export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async ({ commentId, postId }) => {
    await axiosClient.delete("/comments", {
      data: { commentId },
    });

    return {
      commentId,
      postId,
    };
  },
);

const commentsSlice = createSlice({
  name: "commentsSlice",

  initialState: {
    commentsByPost: {},
  },

  extraReducers: (builder) => {
    builder

      // GET COMMENTS
      .addCase(getComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;

        state.commentsByPost[postId] = comments;
      })

      // CREATE COMMENT
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;

        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = [];
        }

        state.commentsByPost[postId].unshift(comment);
      })

      // DELETE COMMENT
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId, postId } = action.payload;

        if (!state.commentsByPost[postId]) return;

        state.commentsByPost[postId] = state.commentsByPost[postId].filter(
          (comment) => comment._id !== commentId,
        );
      });
  },
});

export default commentsSlice.reducer;
