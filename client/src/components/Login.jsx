import React, { useState } from "react";
import config from "../config/index";
import "../styles/Auth.styles.css";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();
    const response = await fetch(`${config.api}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    if (data.status === true) {
      alert("Login Successful");
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } else {
      alert("Login Failed : please check your email and password");
    }
  };

  return (
    <div className="container1">
      <div className="container">
        <div className="github-logo">
          <i className="fa-brands fa-github"></i>
        </div>
        <h1 className="github-head">Log in</h1>
        <div className="login-wrapper">
          <form onSubmit={loginUser}>
            <div className="input-box">
              <div className="input-label">Email</div>
              <input
                id="email"
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-box">
              <div className="input-label">
                <span>Password</span>
                {/* <a href="github-login-page/">Forgot password?</a> */}
              </div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>
        </div>
        <div className="info">
          <span>
            New to Surveillance?{" "}
            <a href="/signup/">Create an account.</a>
          </span>
        </div>
      </div>
    </div>
  );
}
