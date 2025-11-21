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

// store reference
let localStore = null;
export const setAxiosStore = (s) => {
  localStore = s;
};

// prevent multiple 401-handlings
let handlingUnauthorized = false;

//Suppression flag for manual logout
let suppressSessionToast = false;
export const setSuppressSessionToast = (v) => {
  suppressSessionToast = Boolean(v);
};

// request interceptor
axiosClient.interceptors.request.use((request) => {
  localStore?.dispatch?.(setLoading(true));
  return request;
});

// response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    localStore?.dispatch?.(setLoading(false));

    const data = response.data;
    if (data.status === "ok") {
      return data;
    }

    // failure toast
    localStore?.dispatch?.(
      showToast({
        type: TOAST_FAILURE,
        message: data.message || "Something went wrong.",
      })
    );

    return Promise.reject(data.message);
  },
  (error) => {
    localStore?.dispatch?.(setLoading(false));

    // handle unauthorized (401)
    if (error?.response?.status === 401) {
      // Skip session toast if manual logout
      if (!handlingUnauthorized && !suppressSessionToast) {
        handlingUnauthorized = true;

        localStore?.dispatch?.(clearMyProfile());
        localStore?.dispatch?.(
          showToast({
            type: TOAST_FAILURE,
            message: "Session expired. Please log in again.",
          })
        );

        redirectToLogin();

        setTimeout(() => {
          handlingUnauthorized = false;
        }, 3000);
      }

      return Promise.reject(error);
    }

    // general error toast
    localStore?.dispatch?.(
      showToast({
        type: TOAST_FAILURE,
        message: error?.response?.data?.message || error.message,
      })
    );

    return Promise.reject(error);
  }
);
