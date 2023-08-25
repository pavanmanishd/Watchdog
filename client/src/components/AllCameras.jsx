import React, { useEffect, useState } from "react";
import axios from "axios";
import Video_http from "./Video_http";
import "../styles/AllCameras.styles.css";
import Sidebar from "./Sidebar";

export default function AllCameras() {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/cameras")
      .then((response) => {
        for (const entry of Object.entries(response.data)) {
          setCameras((prev) => {
            for (const camera of prev) {
              if (camera[1].name === entry[1].name) {
                return prev;
              }
            }
            return [...prev, entry];
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="cameras-page">
      {/* <Sidebar /> */}
      <div className="all-cameras-container">
        <h1 className="page-title">All Cameras</h1>
        <div className="cameras-list">
          {cameras.map((camera, index) => (
            <Video_http
              key={index}
              url={camera[1].url + "video"}
              index={camera[0]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
