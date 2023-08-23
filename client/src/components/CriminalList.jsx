import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import config from "../config/index";
import "../styles/CriminalList.styles.css"; // Import your CSS file here
import Sidebar from "./Sidebar";

export default function CriminalList() {
  const [criminals, setCriminals] = useState([]);
  useEffect(() => {
    axios
      .get(`${config.api}/criminals`)
      .then((response) => {
        setCriminals(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const history = useHistory();
  const handleClick = (name) => {
    history.push("/criminals/" + name);
  };

  return (
    <div className="criminal-list-page">
      <div className="home-main">
        <div className="sidebar">
          <p className="sidebar-heading">Home</p>
          <p className="sidebar-heading">Criminals</p>
          <p className="sidebar-heading">Encounters</p>
          <p className="sidebar-heading">CCTV</p>
        </div>
        {/* <Sidebar />  */}
        <div className="criminal-list-container">
          <h2 className="criminal-list-title">All Criminals</h2>
          <div className="home-list">
            <table className="table">
              <thead>
                <tr className="table-row">
                  <th className="table-head">Image</th>
                  <th className="table-head">Name</th>
                  <th className="table-head">DOB</th>
                  <th className="table-head">Height</th>
                  <th className="table-head">Weight</th>
                  {/* <th className="table-head">Description</th> */}
                </tr>
              </thead>
              <tbody>
                {criminals.map((criminal, index) => (
                  <tr
                    key={index}
                    className="table-row"
                    onClick={() => handleClick(criminal.fullName)}
                  >
                    <td className="table-data">
                      <img
                        src={
                          `${config.api}/criminals/` + criminal.fullName + "/image"
                        }
                        alt="Criminal Image"
                        className="criminal-image"
                      />
                    </td>
                    <td className="table-data">{criminal.fullName}</td>
                    <td className="table-data">{new Date(criminal.dateOfBirth).getDate() + "/" + (new Date(criminal.dateOfBirth).getMonth()+1) + "/" + new Date(criminal.dateOfBirth).getFullYear()}</td>
                    <td className="table-data">{criminal.height}</td>
                    <td className="table-data">{criminal.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
