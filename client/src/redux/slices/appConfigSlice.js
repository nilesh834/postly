import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";

// Fetch my profile info
export const getMyInfo = createAsyncThunk("user/getMyInfo", async () => {
  const response = await axiosClient.get("/user/getMyInfo");
  return response.result;
});

// Update profile
export const updateMyProfile = createAsyncThunk(
  "user/updateMyProfile",
  async (body) => {
    const response = await axiosClient.put("/user/", body);
    return response.result;
  }
);

// Delete profile
export const deleteMyProfile = createAsyncThunk(
  "user/deleteMyProfile",
  async () => {
    const response = await axiosClient.delete("/user");
    return response.result;
  }
);

const appConfigSlice = createSlice({
  name: "appConfigSlice",
  initialState: {
    isLoading: false,
    toastData: {},
    myProfile: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    showToast: (state, action) => {
      state.toastData = action.payload;
    },
    clearMyProfile: (state) => {
      state.myProfile = null;
    },
    setMyProfile: (state, action) => {
      state.myProfile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyInfo.fulfilled, (state, action) => {
        state.myProfile = action.payload.user;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload.user;
      })
      .addCase(deleteMyProfile.fulfilled, (state, action) => {
        state.myProfile = null;
      });
  },
});

export default appConfigSlice.reducer;

export const { setLoading, showToast, clearMyProfile, setMyProfile } =
  appConfigSlice.actions;
