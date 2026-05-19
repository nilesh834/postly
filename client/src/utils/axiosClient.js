import axios from "axios";

import {
  setLoading,
  showToast,
  clearMyProfile,
} from "../redux/slices/appConfigSlice";

import { TOAST_FAILURE } from "./constants";

import { redirectToLogin } from "./navigationHelper";

const baseURL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_SERVER_BASE_URL
    : "http://localhost:4000";

export const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Store reference
let localStore = null;

export const setAxiosStore = (s) => {
  localStore = s;
};

// Refresh-token state
let isRefreshing = false;

// Suppression flag for manual logout
let suppressSessionToast = false;

export const setSuppressSessionToast = (v) => {
  suppressSessionToast = Boolean(v);
};

// Refresh access token silently
const refreshAccessToken = async () => {
  try {
    await axios.post(
      `${baseURL}/auth/refresh`,
      {},
      {
        withCredentials: true,
      },
    );

    return true;
  } catch (err) {
    console.error("Refresh token failed:", err);
  }
};

// REQUEST INTERCEPTOR
axiosClient.interceptors.request.use((request) => {
  localStore?.dispatch?.(setLoading(true));

  return request;
});

// RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
  (response) => {
    localStore?.dispatch?.(setLoading(false));

    const data = response.data;

    if (data.status === "ok") {
      return data;
    }

    // Failure toast
    localStore?.dispatch?.(
      showToast({
        type: TOAST_FAILURE,
        message: data.message || "Something went wrong.",
      }),
    );

    return Promise.reject(data.message);
  },

  async (error) => {
    localStore?.dispatch?.(setLoading(false));

    // HANDLE 401
    if (error?.response?.status === 401) {
      const originalRequest = error.config;
      if (originalRequest.skipAuthRefresh) {
        return Promise.reject(error);
      }

      // Prevent retry loops
      if (originalRequest._retry) {
        localStore?.dispatch?.(clearMyProfile());

        if (!suppressSessionToast) {
          localStore?.dispatch?.(
            showToast({
              type: TOAST_FAILURE,
              message: "Session expired. Please log in again.",
            }),
          );
        }

        redirectToLogin();

        return Promise.reject(error);
      }

      // Prevent refresh endpoint loops
      if (originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Avoid multiple simultaneous refresh calls
      if (!isRefreshing) {
        isRefreshing = true;

        const refreshSuccess = await refreshAccessToken();

        isRefreshing = false;

        // Retry original request
        if (refreshSuccess) {
          return axiosClient(originalRequest);
        }
      }

      // Refresh failed
      localStore?.dispatch?.(clearMyProfile());

      if (!suppressSessionToast) {
        localStore?.dispatch?.(
          showToast({
            type: TOAST_FAILURE,
            message: "Session expired. Please log in again.",
          }),
        );
      }

      redirectToLogin();

      return Promise.reject(error);
    }

    // GENERAL ERROR HANDLING
    localStore?.dispatch?.(
      showToast({
        type: TOAST_FAILURE,
        message: error?.response?.data?.message || error.message,
      }),
    );

    return Promise.reject(error);
  },
);
