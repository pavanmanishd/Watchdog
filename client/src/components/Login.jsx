import React, { useState } from "react";
import config from "../config/index";
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
    <div>
      <h1>Login</h1>
      <div>
        <form onSubmit={loginUser}>
          <input
            type="text"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
