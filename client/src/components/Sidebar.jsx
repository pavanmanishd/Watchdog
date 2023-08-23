// Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.styles.css";
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-container">
        <p className="sidebar-heading">Home</p>
        <p className="sidebar-heading">Criminals</p>
        <p className="sidebar-heading">Encounters</p>
        <p className="sidebar-heading">CCTV</p>
        {/* Add links or buttons for other sections as needed */}
      </div>
    </div>
  );
};

export default Sidebar;
