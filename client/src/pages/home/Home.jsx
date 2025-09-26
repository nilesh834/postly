import React, { useEffect } from "react";
import { Outlet } from "react-router";
import Navbar from "../../components/navbar/Navbar";
import { useDispatch } from "react-redux";
import { getMyInfo, showToast } from "../../redux/slices/appConfigSlice";
import { TOAST_FAILURE } from "../../App";

function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        await dispatch(getMyInfo()).unwrap();
      } catch (err) {
        dispatch(
          showToast({
            type: TOAST_FAILURE,
            message: err?.message || "Failed to load user info.",
          })
        );
      }
    };
    fetchMyInfo();
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <div className="outlet" style={{ marginTop: "60px" }}>
        <Outlet />
      </div>
    </>
  );
}

export default Home;
