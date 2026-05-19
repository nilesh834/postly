import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";
import { likeAndUnlikePost, updatePost, deletePost } from "./postsSlice";

// Fetch feed data
export const getFeedData = createAsyncThunk(
  "user/getFeedData",
  async ({ page = 1, limit = 5 }) => {
    const response = await axiosClient.get(
      `/user/getFeedData?page=${page}&limit=${limit}`,
    );

    return response.result;
  },
);

// Follow & unfollow a user
export const followAndUnfollowUser = createAsyncThunk(
  "user/followAndUnfollow",
  async (body) => {
    const response = await axiosClient.post("/user/follow", body);
    return response.result.user;
  },
);

const feedSlice = createSlice({
  name: "feedSlice",
  initialState: {
    feedData: {
      posts: [],
      followings: [],
      suggestions: [],
      hasMore: true,
      currentPage: 1,
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getFeedData.fulfilled, (state, action) => {
        const { posts, followings, suggestions, hasMore, currentPage } =
          action.payload;

        // First page → replace posts
        if (currentPage === 1) {
          state.feedData.posts = posts;
        }

        // Next pages → append posts
        else {
          state.feedData.posts.push(...posts);
        }

        state.feedData.followings = followings;
        state.feedData.suggestions = suggestions;

        state.feedData.hasMore = hasMore;
        state.feedData.currentPage = currentPage;
      })
      .addCase(likeAndUnlikePost.fulfilled, (state, action) => {
        const post = action.payload;

        const index = state.feedData?.posts?.findIndex(
          (item) => item._id === post._id,
        );

        if (typeof index === "number" && index >= 0) {
          state.feedData.posts[index] = post;
        }
      })
      .addCase(followAndUnfollowUser.fulfilled, (state, action) => {
        const user = action.payload;
        const index = state.feedData?.followings?.findIndex(
          (item) => item._id === user._id,
        );

        if (typeof index === "number" && index >= 0) {
          state.feedData.followings.splice(index, 1);
        } else {
          state.feedData.followings = state.feedData.followings || [];
          state.feedData.followings.push(user);
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const post = action.payload;

        const index = state.feedData?.posts?.findIndex(
          (item) => item._id === post._id,
        );

        if (typeof index === "number" && index >= 0) {
          state.feedData.posts[index] = post;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedPostId = action.payload;

        if (Array.isArray(state.feedData?.posts)) {
          state.feedData.posts = state.feedData.posts.filter(
            (p) => p._id !== deletedPostId,
          );
        }
      });
  },
});

export default feedSlice.reducer;
