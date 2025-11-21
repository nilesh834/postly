import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.scss";
import { axiosClient } from "../../utils/axiosClient";
import { useDispatch } from "react-redux";
import { showToast, setMyProfile } from "../../redux/slices/appConfigSlice";
import { TOAST_SUCCESS, TOAST_FAILURE } from "../../utils/constants";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleSubmit(e) {
    e.preventDefault();

    // basic client-side validation
    if (!email.trim() || !password.trim()) {
      dispatch(
        showToast({
          type: TOAST_FAILURE,
          message: "Email and password are required.",
        })
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosClient.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const user = response?.result?.user;
      if (user) {
        dispatch(setMyProfile(user));
      } else {
      }

      dispatch(
        showToast({ type: TOAST_SUCCESS, message: "Login successful!" })
      );
      navigate("/");
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="Login">
      <div className="login-box">
        <h2 className="heading">Login</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            value={email}
            type="email"
            className="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            value={password}
            type="password"
            className="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="submit"
            className="submit"
            value={submitting ? "Logging in..." : "Login"}
            disabled={submitting}
          />
        </form>
        <p className="subheading">
          Do not have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
