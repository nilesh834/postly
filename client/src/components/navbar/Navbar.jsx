import React from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { useNavigate } from "react-router";
import Avatar from "../avatar/Avatar";
import "./Navbar.scss";
import { useSelector, useDispatch } from "react-redux";
import { KEY_ACCESS_TOKEN, removeItem } from "../../utils/localStorageManager";
import { axiosClient } from "../../utils/axiosClient";
import { showToast } from "../../redux/slices/appConfigSlice";
import { TOAST_SUCCESS, TOAST_FAILURE } from "../../App";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);

  async function handleLogoutClicked() {
    try {
      await axiosClient.post("/auth/logout");
      removeItem(KEY_ACCESS_TOKEN);

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: "Logged out successfully.",
        })
      );

      navigate("/login");
    } catch (e) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Logout failed. Try again.",
        })
      );
    }
  }

  return (
    <div className="Navbar">
      <div className="container">
        <h2 className="banner hover-link" onClick={() => navigate("/")}>
          Mingle
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
