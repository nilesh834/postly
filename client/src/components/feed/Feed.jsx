import React, { useEffect, useState, useCallback } from "react";

import Follower from "../follower/Follower";
import Post from "../post/Post";

import "./Feed.scss";

import { useSelector, useDispatch } from "react-redux";

import { getFeedData } from "../../redux/slices/feedSlice";

function Feed() {
  const dispatch = useDispatch();

  const feedData = useSelector((state) => state.feedDataReducer.feedData);

  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);

  const [loadingMore, setLoadingMore] = useState(false);

  // INITIAL FETCH
  useEffect(() => {
    if (!myProfile) return;

    dispatch(
      getFeedData({
        page: 1,
        limit: 5,
      }),
    );
  }, [dispatch, myProfile]);

  // LOAD MORE POSTS
  const loadMorePosts = useCallback(async () => {
    if (loadingMore) return;

    if (!feedData?.hasMore) return;

    setLoadingMore(true);

    try {
      await dispatch(
        getFeedData({
          page: feedData.currentPage + 1,
          limit: 5,
        }),
      ).unwrap();
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch, feedData, loadingMore]);

  // SCROLL LISTENER
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      const windowHeight = window.innerHeight;

      const fullHeight = document.documentElement.scrollHeight;

      // LOAD MORE near bottom
      if (scrollTop + windowHeight + 200 >= fullHeight) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadMorePosts]);

  return (
    <div className="Feed">
      <div className="container">
        <div className="left-part">
          {feedData?.posts?.length > 0 ? (
            <>
              {feedData.posts.map((post) => (
                <Post key={post._id} post={post} />
              ))}

              {loadingMore && (
                <p className="loading-more">Loading more posts...</p>
              )}

              {!feedData?.hasMore && feedData?.posts?.length > 0 && (
                <p className="loading-more">No more posts to show.</p>
              )}
            </>
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
