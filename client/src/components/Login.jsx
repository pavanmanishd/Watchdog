import  { useState } from "react";
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
    // console.log(data)
    if (data.status === true) {
      alert("Login Successful");
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } else {
      alert("Login Failed : please check your email and password");
    }
  };
  return (
    // <div>
    //   <h1>Login</h1>
    //   <div>
    //     <form onSubmit={loginUser}>
    //       <input
    //         type="text"
    //         placeholder="email"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //       />
    //       <input
    //         type="password"
    //         placeholder="Password"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //       />
    //       <button type="submit">Login</button>
    //     </form>
    //   </div>
    // </div>
     <div className="custom-body">
    <div className="container">
      <div className="github-logo">
        <i className="fa-brands fa-github"></i>
      </div>
      <h1 className="github-head">Sign in to Surveillance</h1>
      <div className="login-wrapper">
        <form onSubmit={loginUser}>
          <div className="input-box">
            <div className="input-label">Username or email address</div>
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
              <a href="github-login-page/">Forgot password?</a>
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
            Sign in
          </button>
        </form>
      </div>
      <div className="info">
      <span>
        
      New to Surveillance? <a href="/signup/">Create an account.</a>
      </span>
      </div>
    </div>
    </div>
  );
}
