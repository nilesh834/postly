import React, { useEffect } from "react";
import Follower from "../follower/Follower";
import Post from "../post/Post";
import "./Feed.scss";
import { useSelector, useDispatch } from "react-redux";
import { getFeedData } from "../../redux/slices/feedSlice";

function Feed() {
  const dispatch = useDispatch();
  const feedData = useSelector((state) => state.feedDataReducer.feedData);
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);

  useEffect(() => {
    if (!myProfile) return;
    dispatch(getFeedData());
  }, [dispatch, myProfile]);

  return (
    <div className="Feed">
      <div className="container">
        <div className="left-part">
          {feedData?.posts?.length > 0 ? (
            feedData.posts.map((post) => <Post key={post._id} post={post} />)
          ) : (
            <p className="empty">No posts yet. Follow users to see posts!</p>
          )}
        </div>
        <div className="right-part">
          <div className="following">
            <h3 className="title">You Are Following</h3>
            {feedData?.followings?.length > 0 ? (
              feedData.followings.map((user) => (
                <Follower key={user._id} user={user} />
              ))
            ) : (
              <p className="empty">Not following anyone yet.</p>
            )}
          </div>
          <div className="suggestions">
            <h3 className="title">Suggested For You</h3>
            {feedData?.suggestions?.length > 0 ? (
              feedData.suggestions.map((user) => (
                <Follower key={user._id} user={user} />
              ))
            ) : (
              <p className="empty">No suggestions available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;
