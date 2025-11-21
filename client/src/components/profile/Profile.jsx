import React, { useEffect, useState } from "react";
import Post from "../post/Post";
import "./Profile.scss";
import userImg from "../../assets/user.png";
import { useNavigate, useParams } from "react-router-dom";
import CreatePost from "../createPost/CreatePost";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../../redux/slices/postsSlice";
import {
  followAndUnfollowUser,
  getFeedData,
} from "../../redux/slices/feedSlice";
import { showToast } from "../../redux/slices/appConfigSlice";
import { TOAST_SUCCESS } from "../../utils/constants";

function Profile() {
  const navigate = useNavigate();
  const params = useParams();
  const userProfile = useSelector((state) => state.postsReducer.userProfile);
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const feedData = useSelector((state) => state.feedDataReducer.feedData);
  const dispatch = useDispatch();

  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!myProfile) return;

    dispatch(getUserProfile({ userId: params.userId }));

    setIsMyProfile(myProfile?._id === params.userId);
    setIsFollowing(
      !!feedData?.followings?.find((item) => item._id === params.userId)
    );
  }, [myProfile, params.userId, feedData, dispatch]);

  async function handleUserFollow() {
    if (followLoading) return;
    setFollowLoading(true);

    try {
      await dispatch(
        followAndUnfollowUser({ userIdToFollow: params.userId })
      ).unwrap();

      await dispatch(getFeedData()).unwrap();

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: isFollowing ? "Unfollowed user." : "Followed user.",
        })
      );
    } finally {
      setFollowLoading(false);
    }
  }

  return (
    <div className="Profile">
      <div className="container">
        <div className="left-part">
          {isMyProfile && <CreatePost />}
          {userProfile?.posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
        <div className="right-part">
          <div className="profile-card">
            <img
              className="user-img"
              src={userProfile?.avatar?.url || userImg}
              alt={userProfile?.name || "User"}
            />
            <h3 className="user-name">{userProfile?.name}</h3>
            <p className="bio">{userProfile?.bio}</p>
            <div className="follower-info">
              <h4>{`${userProfile?.followers?.length || 0} Followers`}</h4>
              <h4>{`${userProfile?.followings?.length || 0} Followings`}</h4>
            </div>
            {!isMyProfile && (
              <h5
                onClick={handleUserFollow}
                className={
                  isFollowing ? "hover-link follow-link" : "btn-primary"
                }
                style={{
                  marginTop: "10px",
                  opacity: followLoading ? 0.6 : 1,
                  pointerEvents: followLoading ? "none" : "auto",
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </h5>
            )}
            {isMyProfile && (
              <button
                className="update-profile btn-secondary"
                onClick={() => {
                  navigate("/updateProfile");
                }}
              >
                Update Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
