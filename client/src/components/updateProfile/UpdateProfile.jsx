import React, { useEffect, useState } from "react";
import "./UpdateProfile.scss";
import dummyUserImg from "../../assets/user.png";
import { useSelector, useDispatch } from "react-redux";
import {
  updateMyProfile,
  deleteMyProfile,
  showToast,
  clearMyProfile,
} from "../../redux/slices/appConfigSlice";
import { useNavigate } from "react-router-dom";
import { TOAST_SUCCESS, TOAST_FAILURE } from "../../utils/constants";
import { setSuppressSessionToast } from "../../utils/axiosClient";

function UpdateProfile() {
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [userImg, setUserImg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setName(myProfile?.name || "");
    setBio(myProfile?.bio || "");
    setUserImg(myProfile?.avatar?.url || "");
  }, [myProfile]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Only image files are allowed.",
        })
      );
      return;
    }

    // Validate file size (<2MB)
    if (file.size > 2 * 1024 * 1024) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "File size should be less than 2MB.",
        })
      );
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      if (fileReader.readyState === FileReader.DONE) {
        setUserImg(fileReader.result);
      }
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Prevent empty updates
    const originalName = myProfile?.name || "";
    const originalBio = myProfile?.bio || "";
    const originalAvatarUrl = myProfile?.avatar?.url || "";
    const currentAvatarUrl = userImg || "";

    if (
      name === originalName &&
      bio === originalBio &&
      currentAvatarUrl === originalAvatarUrl
    ) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Please update at least one field before saving.",
        })
      );
      return;
    }

    // Validation rules
    if (name !== undefined && !name.trim()) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Name cannot be empty.",
        })
      );
      return;
    }

    if (bio !== undefined && !bio.trim()) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Bio cannot be empty.",
        })
      );
      return;
    }

    const payload = {};
    if (name !== myProfile?.name) payload.name = name.trim();
    if (bio !== myProfile?.bio) payload.bio = bio.trim();

    if (
      typeof userImg === "string" &&
      userImg &&
      userImg !== myProfile?.avatar?.url &&
      userImg.startsWith("data:")
    ) {
      payload.userImg = userImg;
    }

    try {
      const res = await dispatch(updateMyProfile(payload)).unwrap();

      if (res?.warning) {
        dispatch(
          showToast({
            type: TOAST_FAILURE,
            message:
              "Profile updated but avatar upload failed. Try again later.",
          })
        );
      } else {
        dispatch(
          showToast({
            type: TOAST_SUCCESS,
            message: "Profile updated successfully!",
          })
        );
      }

      navigate(`/profile/${myProfile._id}`);
    } catch (err) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: err?.message || "Failed to update profile.",
        })
      );
    }
  }

  async function confirmDeleteAccount() {
    try {
      setSuppressSessionToast(true);

      await dispatch(deleteMyProfile()).unwrap();

      dispatch(clearMyProfile());

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: "Account deleted successfully.",
        })
      );

      navigate("/login");
    } catch (err) {
    } finally {
      setShowDeleteModal(false);

      setTimeout(() => setSuppressSessionToast(false), 800);
    }
  }

  return (
    <div className="UpdateProfile">
      <div className="container">
        <div className="left-part">
          <div className="input-user-img">
            <label htmlFor="inputImg" className="labelImg">
              <img src={userImg || dummyUserImg} alt={name} />
            </label>
            <input
              className="inputImg"
              id="inputImg"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="right-part">
          <form onSubmit={handleSubmit}>
            <input
              value={name}
              type="text"
              placeholder="Your Name"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              value={bio}
              type="text"
              placeholder="Your Bio"
              onChange={(e) => setBio(e.target.value)}
            />
            <input type="submit" className="btn-primary" value="Save" />
          </form>

          <button
            type="button"
            className="delete-account btn-primary"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure?</h3>
            <p>
              This action cannot be undone. Your account will be permanently
              deleted.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDeleteAccount}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateProfile;
