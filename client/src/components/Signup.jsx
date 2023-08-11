import React, { useState, useEffect } from "react";
import config from "../config/index";
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
    <div>
      <h1>Signup</h1>
      <div>
        <form onSubmit={signupUser}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
}
