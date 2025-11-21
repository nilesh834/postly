import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyInfo } from "../redux/slices/appConfigSlice";

function RequireUser() {
  const dispatch = useDispatch();
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!myProfile) {
      dispatch(getMyInfo())
        .unwrap()
        .catch(() => {})
        .finally(() => setChecked(true));
    } else {
      setChecked(true);
    }
  }, [dispatch, myProfile]);

  if (!checked) {
    return null;
  }

  return myProfile ? <Outlet /> : <Navigate to="/login" />;
}

export default RequireUser;
