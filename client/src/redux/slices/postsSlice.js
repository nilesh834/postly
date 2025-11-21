import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";

// Get a user profile
export const getUserProfile = createAsyncThunk(
  "user/getUserProfile",
  async (body) => {
    const response = await axiosClient.post("/user/getUserProfile", body);
    return response.result;
  }
);

// Like & unlike post
export const likeAndUnlikePost = createAsyncThunk(
  "post/likeAndUnlike",
  async (body) => {
    const response = await axiosClient.post("/posts/like", body);
    return response.result.post;
  }
);

export const updatePost = createAsyncThunk("post/updatePost", async (body) => {
  const response = await axiosClient.put("/posts", body);
  return response.result.post;
});

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async ({ postId }) => {
    await axiosClient.delete("/posts", { data: { postId } });

    return postId;
  }
);

const postsSlice = createSlice({
  name: "postsSlice",
  initialState: {
    userProfile: {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
      })
      .addCase(likeAndUnlikePost.fulfilled, (state, action) => {
        const post = action.payload;

        const index = state.userProfile?.posts?.findIndex(
          (item) => item._id === post._id
        );

        if (typeof index === "number" && index >= 0) {
          state.userProfile.posts[index] = post;
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const post = action.payload;

        const index = state.userProfile?.posts?.findIndex(
          (item) => item._id === post._id
        );

        if (typeof index === "number" && index >= 0) {
          state.userProfile.posts[index] = post;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedPostId = action.payload;

        if (Array.isArray(state.userProfile?.posts)) {
          state.userProfile.posts = state.userProfile.posts.filter(
            (p) => p._id !== deletedPostId
          );
        }
      });
  },
});

export default postsSlice.reducer;
