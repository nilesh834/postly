import { configureStore } from "@reduxjs/toolkit";
import appConfigReducer from "./slices/appConfigSlice";
import postsReducer from "./slices/postsSlice";
import feedDataReducer from "./slices/feedSlice";
import commentsReducer from "./slices/commentsSlice";

const store = configureStore({
  reducer: {
    appConfigReducer,
    postsReducer,
    feedDataReducer,
    commentsReducer,
  },
});

export default store;
