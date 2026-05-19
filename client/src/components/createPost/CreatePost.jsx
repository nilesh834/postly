import React, { useState } from "react";
import Avatar from "../avatar/Avatar";
import "./CreatePost.scss";
import { BsCardImage } from "react-icons/bs";
import { axiosClient } from "../../utils/axiosClient";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../../redux/slices/postsSlice";
import { showToast } from "../../redux/slices/appConfigSlice";
import { prependFeedPost } from "../../redux/slices/feedSlice";
import { TOAST_SUCCESS, TOAST_FAILURE } from "../../utils/constants";

function CreatePost() {
  const [postImg, setPostImg] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Only image files are allowed.",
        }),
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "File size should be less than 2MB.",
        }),
      );
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      if (fileReader.readyState === FileReader.DONE) {
        setPostImg(fileReader.result);
      }
    };
  };

  const handlePostSubmit = async () => {
    if (!caption || !postImg) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Both caption and image are required to create a post.",
        }),
      );

      return;
    }

    if (uploading) return;

    setUploading(true);

    try {
      const response = await axiosClient.post("/posts", {
        caption,
        postImg,
      });

      // Refresh profile posts
      await dispatch(
        getUserProfile({
          userId: myProfile?._id,
        }),
      );

      dispatch(prependFeedPost(response.result.post));

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: "Post created successfully 🎉",
        }),
      );

      setCaption("");
      setPostImg("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="CreatePost">
      <div className="left-part">
        <Avatar src={myProfile?.avatar?.url} />
      </div>
      <div className="right-part">
        <input
          value={caption}
          type="text"
          className="captionInput"
          placeholder="What's on your mind?"
          onChange={(e) => setCaption(e.target.value)}
        />
        {postImg && (
          <div className="img-container">
            <img className="post-img" src={postImg} alt="post" />
          </div>
        )}

        <div className="bottom-part">
          <div className="input-post-img">
            <label htmlFor="inputImg" className="labelImg">
              <BsCardImage />
            </label>
            <input
              className="inputImg"
              id="inputImg"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <button
            type="button"
            className="post-btn btn-primary"
            onClick={handlePostSubmit}
            disabled={uploading}
            style={{
              opacity: uploading ? 0.7 : 1,
              pointerEvents: uploading ? "none" : "auto",
            }}
          >
            {uploading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
