import React, { useEffect, useState } from "react";
import Post from "../post/Post";
import "./Profile.scss";
import userImg from "../../assets/user.png";
import { useNavigate, useParams } from "react-router";
import CreatePost from "../createPost/CreatePost";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../../redux/slices/postsSlice";
import { followAndUnfollowUser } from "../../redux/slices/feedSlice";
import { showToast } from "../../redux/slices/appConfigSlice";
import { TOAST_SUCCESS, TOAST_FAILURE } from "../../App";

function Profile() {
  const navigate = useNavigate();
  const params = useParams();
  const userProfile = useSelector((state) => state.postsReducer.userProfile);
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const feedData = useSelector((state) => state.feedDataReducer.feedData);
  const dispatch = useDispatch();
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    dispatch(getUserProfile({ userId: params.userId }));

    setIsMyProfile(myProfile?._id === params.userId);
    setIsFollowing(
      !!feedData?.followings?.find((item) => item._id === params.userId)
    );
  }, [myProfile, params.userId, feedData, dispatch]);

  async function handleUserFollow() {
    try {
      await dispatch(
        followAndUnfollowUser({ userIdToFollow: params.userId })
      ).unwrap();

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: isFollowing ? "Unfollowed user." : "Followed user.",
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: err?.message || "Failed to update follow status.",
        })
      );
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
                style={{ marginTop: "10px" }}
                onClick={handleUserFollow}
                className={
                  isFollowing ? "hover-link follow-link" : "btn-primary"
                }
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
