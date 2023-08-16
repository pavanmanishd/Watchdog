import { useState } from "react";
import config from "../config/index";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const signupUser = async (e) => {
    e.preventDefault();
    const response = await fetch(`${config.api}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    const data = await response.json();
    if (data.status === true) {
      window.location.href = "/login";
    } else {
      alert("Signup Failed: please check your email and password");
    }
  };

  return (
    <div className="custom-body">
    <div className="container">
      <div className="github-logo">
        <i className="fa-brands fa-github"></i>
      </div>
      <h1 className="github-head">Sign up to Surveillance</h1>
      <div className="login-wrapper">
        <form onSubmit={signupUser}>
          <div className="input-box">
            <div className="input-label">Username</div>
            <input
              required
              type="text"
              className="inputp"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-box">
            <div className="input-label">Email</div>
            <input
              required
              type="text"
              className="inpute"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-box">
            <div className="input-label">
              <span>Password</span>
            </div>
            <input
              required
              type="password"
              className="inputp"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="submit-btn" type="submit">
            Sign up
          </button>
        </form>
      </div>
      <div className="info">
        <span>
          Already have an account? <a href="/login/">Login.</a>
        </span>
      </div>
    </div>
    </div>
  );
}
/********************/
