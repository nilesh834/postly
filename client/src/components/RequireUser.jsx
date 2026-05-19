import React, { useEffect, useState } from "react";

import { Navigate, Outlet } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { getMyInfo } from "../redux/slices/appConfigSlice";

function RequireUser() {
  const dispatch = useDispatch();

  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);

  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(getMyInfo()).unwrap();
      } catch (err) {
      } finally {
        setCheckedAuth(true);
      }
    };

    // Only check once on mount
    if (!checkedAuth && !myProfile) {
      checkAuth();
    } else {
      setCheckedAuth(true);
    }
  }, [dispatch, myProfile]);

  // Prevent flashing during auth check
  if (!checkedAuth) {
    return null;
  }

  // If logged out → redirect immediately
  if (!myProfile) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RequireUser;
