import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import config from "../config/index";
import axios from "axios";
import "../styles/Home.styles.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Home() {
  const [encounters, setEncounters] = useState([]);
  const [images, setImages] = useState({});
  const [encounterState, setEncounterState] = useState("Loading...");
  const history = useHistory();

  useEffect(() => {
    axios.get(`${config.api}/encounters/10`).then((response) => {
      const data = response.data;
      setEncounters(data);
      if (data.length === 0) {
        setEncounterState("No encounters found");
      }
      // Fetch images for each encounter
      data.forEach((encounter) => {
        fetchImage(encounter.name);
      });
    });
  }, []);

  const fetchImage = async (name) => {
    try {
      const response = await axios.get(`${config.api}/criminals/${name}/image`, {
        responseType: "blob", // Request the response as a blob
      });

      // Create an object URL from the blob response to display the image
      const imageUrl = URL.createObjectURL(response.data);

      // Store the image URL in the state
      setImages((prevImages) => ({
        ...prevImages,
        [name]: imageUrl,
      }));
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleClick = (encounter) => {
    // history.push(`/camera/${id}`);
    const time = encounter.timestamp.split(" ");
    history.push(`/encounter/${encounter.name}/${time[0]}/${time[1].replaceAll(":","/")}`);
  };

  const Encounter = () => {
    return (
      <>
        {encounters.map((encounter, index) => {
          return (
            <tr
              key={index}
              className="table-row"
              onClick={() => handleClick(encounter)}
            >
              <td className="table-data">
                {images[encounter.name] ? (
                  <img
                    src={images[encounter.name]}
                    alt={`Photo ${encounter.name}`}
                    className="encounter-image"
                  />
                ) : (
                  <div>Loading Image...</div>
                )}
              </td>
              <td className="table-data">{encounter.name}</td>
              <td className="table-data">{encounter.location}</td>
              <td className="table-data">{encounter.timestamp}</td>
              <td className="table-data">{encounter.camera_id}</td>
            </tr>
          );
        })}
      </>
    );
  };

  return (
    <main className="home-page">
      <Navbar />
      <div className="home-main">
        {/* <div className="sidebar">
          <p className="sidebar-heading">Home</p>
          <p className="sidebar-heading">Criminals</p>
          <p className="sidebar-heading">Encounters</p>
          <p className="sidebar-heading">CCTV</p>
          {/* <button>Add Criminal</button> */}
        {/* </div> */}
        <Sidebar />
        <div className="home-container">
          <p className="home-head">Recent Encounters</p>
          <div className="home-list">
            <table className="table">
              <thead>
                <tr className="table-row">
                  <th className="table-head">Image</th>
                  <th className="table-head">Name</th>
                  <th className="table-head">Location</th>
                  <th className="table-head">Timestamp</th>
                  <th className="table-head">Camera ID</th>
                  {/* <th className="table-head">Link</th> */}
                </tr>
              </thead>
              <tbody>
                {encounters.length === 0 ? <tr><td colSpan="5">{encounterState}</td></tr> : <Encounter />}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

