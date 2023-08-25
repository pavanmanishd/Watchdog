// Sidebar.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import "../styles/Sidebar.styles.css";
const Sidebar = () => {
  const history = useHistory();
  useEffect(() => {
    // check if the current route is /login or /signup
    const isLoginPage =
      history.location.pathname === "/login" ||
      history.location.pathname === "/login/";
    const isSignupPage =
      history.location.pathname === "/signup" ||
      history.location.pathname === "/signup/";
    if (isLoginPage || isSignupPage) {
      // Hide the navbar if the current route is /login or /signup
      document.querySelector(".sidebar").style.display = "none";
    }
  }, [history.location.pathname]);
  return (
    <div className="sidebar">
      <div className="sidebar-container">
        <p
          className="sidebar-heading"
          onClick={() => {
            history.push("/");
          }}
        >
          Home
        </p>
        <p
          className="sidebar-heading"
          onClick={() => {
            history.push("/criminals");
          }}
        >
          Criminals
        </p>
        <p
          className="sidebar-heading"
          onClick={() => {
            history.push("/encounters");
          }}
        >
          Encounters
        </p>
        <p
          className="sidebar-heading"
          onClick={() => {
            history.push("/cameras");
          }}
        >
          CCTV
        </p>
        {/* Add links or buttons for other sections as needed */}
        <button className="sidebar-button" onClick={() => {history.push("/upload")}}>
          {/* <Link className="sidebar-link" to="/upload"> */}
            Add Criminal
          {/* </Link> */}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
