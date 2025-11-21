import React, { useEffect, useState } from "react";
import Avatar from "../avatar/Avatar";
import "./Follower.scss";
import { useSelector, useDispatch } from "react-redux";
import {
  followAndUnfollowUser,
  getFeedData,
} from "../../redux/slices/feedSlice";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../redux/slices/appConfigSlice";
import { TOAST_SUCCESS } from "../../utils/constants";

function Follower({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const feedData = useSelector((state) => state.feedDataReducer.feedData);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(
      !!feedData?.followings?.find((item) => item._id === user._id)
    );
  }, [feedData, user._id]);

  async function handleUserFollow() {
    if (loading) return;
    setLoading(true);

    try {
      await dispatch(
        followAndUnfollowUser({
          userIdToFollow: user._id,
        })
      ).unwrap();

      // Refresh Feed Data
      await dispatch(getFeedData()).unwrap();

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: isFollowing ? "Unfollowed user." : "Followed user!",
        })
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="Follower">
      <div
        className="user-info"
        onClick={() => navigate(`/profile/${user._id}`)}
      >
        <Avatar src={user?.avatar?.url} />
        <h4 className="name">{user?.name}</h4>
      </div>

      <h5
        onClick={handleUserFollow}
        className={isFollowing ? "hover-link follow-link" : "btn-primary"}
        style={{
          opacity: loading ? 0.6 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </h5>
    </div>
  );
}

export default Follower;
