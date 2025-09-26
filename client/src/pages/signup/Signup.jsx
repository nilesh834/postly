import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";
import { useDispatch } from "react-redux";
import { showToast } from "../../redux/slices/appConfigSlice";
import { TOAST_SUCCESS, TOAST_FAILURE } from "../../App";
import "./Signup.scss";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axiosClient.post("/auth/signup", {
        name,
        email,
        password,
      });

      dispatch(
        showToast({
          type: TOAST_SUCCESS,
          message: "Signup successful! Please log in.",
        })
      );

      navigate("/login");
    } catch (error) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message:
            error?.response?.data?.message || "Signup failed. Try again.",
        })
      );
    }
  }

  return (
    <div className="Signup">
      <div className="signup-box">
        <h2 className="heading">Signup</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input type="submit" className="submit" value="Sign Up" />
        </form>
        <p className="subheading">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
