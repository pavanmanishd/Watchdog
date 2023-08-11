
import  { useState, useEffect } from "react";
import config from "../config/index";

import "../styles/Auth.styles.css";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const signupUser = async (e) => {
    e.preventDefault();
    // console.log("signupUser",username,email,password);
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
    // console.log(data)
    if (data.status === true) {
      window.location.href = "/login";
    } else {
      alert("Signup Failed : please check your email and password");
    }
  };
  return (
    // <div>
    //   <h1>Signup</h1>
    //   <div>
    //     <form onSubmit={signupUser}>
    //       <input
    //         type="text"
    //         placeholder="Username"
    //         value={username}
    //         onChange={(e) => setUsername(e.target.value)}
    //       />
    //       <input
    //         type="email"
    //         placeholder="Email"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //       />
    //       <input
    //         type="password"
    //         placeholder="Password"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //       />
    //       <button type="submit">Signup</button>
    //     </form>
    //   </div>
    // </div>
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-box">
            <div className="input-label">Email</div>
            <input
              required
              type="text"
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
  );
}
