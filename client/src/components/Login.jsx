import { useState } from "react";
import config from "../config/index";
import "../styles/Auth.styles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();
    const response = await fetch(`${config.authapi}/login`, {
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
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } else {
      alert("Login Failed : please check your email and password");
    }
  };
  return (
    <main className="page">
      <div className="main-container">
        <div className="container">
          <h1 className="heading">Login</h1>
          <div className="group">
            <label htmlFor="email" className="label">Email address</label>
            <input
              name="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="group">
            <label htmlFor="password" className="label">Password</label>
            <input
              name="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn" onClick={loginUser}>Log In</button>
          <hr className="hr"/>
          <div className="group2">
            <p className="context">Don't have an account? </p>
            <a href="/signup" className="link"><button className="link-btn">Sign Up</button></a>
          </div>
        </div>
      </div>
    </main>
  );
}
