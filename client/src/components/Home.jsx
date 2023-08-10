import React, { useEffect } from "react";
import {useHistory} from "react-router-dom";

export default function Home() {
  const history = useHistory();
  const handleLogin = () => {
    console.log("login");
    history.push("/login");
  }
  const handleSignUp = () => {
    console.log("signup");
    history.push("/signup");
  }
  const checkToken = async (token) => {
    const res = await fetch("http://localhost:8000/api/token", {
      headers: {
        "x-access-token": token,
      },
    });
    const data = await res.json();
    if (data.status === false) {
      localStorage.removeItem("token");
      history.push("/login");
    } else {
      console.log('token is valid')
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkToken(token);
    }
  }, []);
    return (
    <div>
        <button onClick={handleLogin} >Login</button>
       <button onClick={handleSignUp}>Sign Up</button>
        <h1>Dashboard</h1>
      </div>
  );
}