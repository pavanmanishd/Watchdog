import { useState } from "react";
import config from "../config/index";
import "../styles/Auth.styles.css"
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
    // <div className="custom-body">
    // <div className="container">
    //   <div className="github-logo">
    //     <i className="fa-brands fa-github"></i>
    //   </div>
    //   <h1 className="github-head">Sign up to Surveillance</h1>
    //   <div className="login-wrapper">
    //     <form onSubmit={signupUser}>
    //       <div className="input-box">
    //         <div className="input-label">Username</div>
    //         <input
    //           required
    //           type="text"
    //           className="inputp"
    //           value={username}
    //           onChange={(e) => setUsername(e.target.value)}
    //         />
    //       </div>
    //       <div className="input-box">
    //         <div className="input-label">Email</div>
    //         <input
    //           required
    //           type="text"
    //           className="inpute"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //         />
    //       </div>
    //       <div className="input-box">
    //         <div className="input-label">
    //           <span>Password</span>
    //         </div>
    //         <input
    //           required
    //           type="password"
    //           className="inputp"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //         />
    //       </div>
    //       <button className="submit-btn" type="submit">
    //         Sign up
    //       </button>
    //     </form>
    //   </div>
    //   <div className="info">
    //     <span>
    //       Already have an account? <a href="/login/">Login.</a>
    //     </span>
    //   </div>
    // </div>
    // </div>

    <main className="page">
      <div className="main-container">
        <div className="container">
          <h1 className="heading">SignUp</h1>
          <div className="group">
            <label htmlFor="email" className="label">
              Email address
            </label>
            <input
              name="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="group">
            <label htmlFor="username" className="label">
              Username
            </label>
            <input
              name="username"
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              name="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn">Sign Up</button>
          <hr className="hr" />
          <div className="group2">
            <p className="context">Already have an account? </p>
            <a href="/login" className="link">
              <button className="link-btn">Log In</button>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
