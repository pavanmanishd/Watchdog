import React, { useState } from "react";
import config from "../config/index";
import styles from "../styles/Login.module.css";
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
    <body className={styles.body}>
      <div className={styles.container}>
        <div className={styles.login_box}>
          <h1 className={styles.heading}>Login</h1>
          <form onSubmit={loginUser}>
            <div className={styles.input_group}>
              <label htmlFor="username" className={styles.label}>Username</label>
              <input
                id="email"
                type="text"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input_field}
              />
            </div>
            <div>
              <label htmlFor="password" className={styles.label} >Password</label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input_field}
              />
            </div>
            <button type="submit" className={styles.btn}>Login</button>
          </form>
        </div>
      </div>
    </body>
  );
}
