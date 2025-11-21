import React from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import Avatar from "../avatar/Avatar";
import "./Navbar.scss";
import { useSelector, useDispatch } from "react-redux";
import { axiosClient, setSuppressSessionToast } from "../../utils/axiosClient";
import { showToast, clearMyProfile } from "../../redux/slices/appConfigSlice";
import { TOAST_SUCCESS } from "../../utils/constants";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);

  async function handleLogoutClicked() {
    setSuppressSessionToast(true);

    try {
      await axiosClient.post("/auth/logout");

      dispatch(clearMyProfile());
      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: "Logged out successfully.",
        })
      );

      navigate("/login");
    } catch (err) {
      dispatch(clearMyProfile());
      navigate("/login");
    } finally {
      setTimeout(() => setSuppressSessionToast(false), 800);
    }
  }

  return (
    <div className="Navbar">
      <div className="container">
        <h2 className="banner hover-link" onClick={() => navigate("/")}>
          Postly
        </h2>
        <div className="right-side">
          {myProfile && (
            <div
              className="profile hover-link"
              onClick={() => navigate(`/profile/${myProfile._id}`)}
            >
              <Avatar src={myProfile?.avatar?.url} />
            </div>
          )}
          <div className="logout hover-link" onClick={handleLogoutClicked}>
            <AiOutlineLogout />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
