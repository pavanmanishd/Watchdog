import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import "../styles/Video.styles.css"; // Import the CSS file with styles for the Video_http component
import Sidebar from "./Sidebar";

export default function Video_http({ url, index }) {
  const history = useHistory();
  const { id } = useParams();
  const [URL, setURL] = React.useState(url);
  const [camera, setCamera] = React.useState(null);

  useEffect(() => {
    if (id != null) {
      axios
        .get("http://localhost:3001/cameras/" + id)
        .then((response) => {
          console.log(response.data);
          setCamera(response.data);
          setURL(response.data.url + "video");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  const handleClick = () => {
    history.push("/camera/" + index);
  };

  return (
    <>
      {camera != null ? (
        <div className="cameras-page">
          <Sidebar />
        <div className="video-card">
          <h2 className="camera-name">{camera.name}</h2>
          <p className="camera-location">{camera.location}</p>
          <img
            src={URL}
            width="640"
            height="480"
            style={{ border: "2px solid black" }}
            alt="Video Frame"
            onClick={() => {
              if (id == null) handleClick();
            }}
          />
          </div>
        </div>
      ) : (
        <div className="camera-card">
          {" "}
          {/* Apply the camera-card style */}
          <img
            src={URL}
            width="640"
            height="480"
            style={{ border: "2px solid black" }}
            alt="Video Frame"
            onClick={() => {
              if (id == null) handleClick();
            }}
          />
        </div>
      )}
    </>
  );
}
