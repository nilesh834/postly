import React, { useEffect, useState } from "react";
import "./UpdateProfile.scss";
import dummyUserImg from "../../assets/user.png";
import { useSelector, useDispatch } from "react-redux";
import {
  updateMyProfile,
  deleteMyProfile,
  showToast,
} from "../../redux/slices/appConfigSlice";
import { useNavigate } from "react-router";
import { TOAST_SUCCESS, TOAST_FAILURE } from "../../App";

function UpdateProfile() {
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [userImg, setUserImg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); // ✅ modal state
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
    try {
      await dispatch(updateMyProfile({ name, bio, userImg })).unwrap();

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: "Profile updated successfully!",
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: err?.response?.data?.message || "Failed to update profile.",
        })
      );
    }
  }

  async function confirmDeleteAccount() {
    try {
      await dispatch(deleteMyProfile()).unwrap();
      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: "Account deleted successfully.",
        })
      );
      navigate("/login");
    } catch (err) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: err?.response?.data?.message || "Failed to delete account.",
        })
      );
    } finally {
      setShowDeleteModal(false); // ✅ always close modal
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
            className="delete-account btn-secondary"
            onClick={() => setShowDeleteModal(true)} // ✅ open modal
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* ✅ Custom Delete Modal */}
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
