import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import config from "../config/index";
import axios from "axios";
import "../styles/EncounterList.styles.css";

export default function EncounterList() {
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
        fetchImage(encounter);
      });
    });
  }, []);

  const fetchImage = async (encounter) => {
    try {
      // const timestamp = encounter.timestamp.split(" ");
      const response = await axios.get(
        `${config.api}/criminals/${encounter.name}/image`,
        // `${config.api}/encounters/${encounter.name}/${timestamp[0]}/${timestamp[1].replaceAll(":","/")}/image`,
        {
          responseType: "blob", // Request the response as a blob
        }
      );

      // Create an object URL from the blob response to display the image
      const imageUrl = URL.createObjectURL(response.data);

      // Store the image URL in the state
      setImages((prevImages) => ({
        ...prevImages,
        [encounter.name]: imageUrl,
      }));
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleClick = (encounter) => {
    // history.push(`/camera/${id}`);
    const time = encounter.timestamp.split(" ");
    history.push(
      `/encounter/${encounter.name}/${time[0]}/${time[1].replaceAll(":", "/")}`
    );
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
    <div className="encounter-list-page">
      <div className="home-main">
        <div className="sidebar">
          <p className="sidebar-heading">Home</p>
          <p className="sidebar-heading">Criminals</p>
          <p className="sidebar-heading">Encounters</p>
          <p className="sidebar-heading">CCTV</p>
        </div>
        <div className="encounter-list-container">
          <h2 className="encounter-list-title">Encounters</h2>
          <div className="home-list">
            <table className="table">
              <thead>
                <tr className="table-row">
                  <th className="table-head">Image</th>
                  <th className="table-head">Name</th>
                  <th className="table-head">Location</th>
                  <th className="table-head">Timestamp</th>
                  <th className="table-head">Camera ID</th>
                </tr>
              </thead>
              <tbody>
                {encounters.length === 0 ? (
                  <tr>
                    <td colSpan="5">{encounterState}</td>
                  </tr>
                ) : (
                  <Encounter />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
