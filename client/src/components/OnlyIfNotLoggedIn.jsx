import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function OnlyIfNotLoggedIn() {
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  return myProfile ? <Navigate to="/" /> : <Outlet />;
}

export default OnlyIfNotLoggedIn;
