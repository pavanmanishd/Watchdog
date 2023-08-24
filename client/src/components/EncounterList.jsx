import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import config from "../config/index";
import axios from "axios";
import "../styles/EncounterList.styles.css";

export default function EncounterList() {
  const [encounters, setEncounters] = useState([]);
  const [images, setImages] = useState({});
  const [encounterState, setEncounterState] = useState("Loading...");
  const [locationFilter, setLocationFilter] = useState("");
  const [cameraFilter, setCameraFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // New state for search
  const history = useHistory();

  useEffect(() => {
    axios.get(`${config.api}/encounters/`).then((response) => {
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
      // const timestamp = name.split("_")[1]; // Assuming your encounter name is in the format "Name_Timestamp"
      const response = await axios.get(
        `${config.api}/criminals/${name}/image`,
        {
          responseType: "blob", // Request the response as a blob
        }
      );

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
    console.log("Clicked on encounter:", encounter);
    const timestamp = encounter.timestamp.split(" "); // Assuming your encounter name is in the format "Name_Timestamp"
    history.push(
      `/encounter/${encounter.name}/${timestamp[0]}/${timestamp[1].replaceAll(":","/")}`
    );
  };

  // Filter and sort logic
  const filteredEncounters = encounters
    .filter((encounter) => {
      if (locationFilter) {
        return encounter.location === locationFilter;
      }
      return true; // If no location filter is set, include all locations
    })
    .filter((encounter) => {
      if (cameraFilter) {
        return encounter.camera_id === cameraFilter;
      }
      return true; // If no camera filter is set, include all cameras
    })
    .filter((encounter) => {
      if (searchTerm) {
        // Filter by name or location containing the search term (case insensitive)
        return (
          encounter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          encounter.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true; // If no search term is provided, include all encounters
    });

  const Encounter = () => {
    return (
      <>
        {filteredEncounters.map((encounter, index) => {
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
      <div className="encounter-main">
        {/* <div className="sidebar">
          <p className="sidebar-heading">Home</p>
          <p className="sidebar-heading">Criminals</p>
          <p className="sidebar-heading">Encounters</p>
          <p className="sidebar-heading">CCTV</p>
        </div> */}
        <div className="encounter-list-container">
          <h2 className="encounter-list-title">Encounters</h2>

          {/* Filter Form */}
          <form className="filter-form">
            <label htmlFor="locationFilter">Location:</label>
            <select
              id="locationFilter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All</option>
              {/* Map over the unique locations to create options */}
              {Array.from(new Set(encounters.map((e) => e.location))).map(
                (location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                )
              )}
            </select>

            <label htmlFor="cameraFilter">Camera:</label>
            <select
              id="cameraFilter"
              value={cameraFilter}
              onChange={(e) => setCameraFilter(e.target.value)}
            >
              <option value="">All</option>
              {/* Map over the unique camera IDs to create options */}
              {Array.from(new Set(encounters.map((e) => e.camera_id))).map(
                (camera_id, index) => (
                  <option key={index} value={camera_id}>
                    {camera_id}
                  </option>
                )
              )}
            </select>

            {/* Search Input */}
            {/* <label htmlFor="searchTerm">Search:</label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            /> */}

            {/* <button onClick={(e) => e.preventDefault()}>Filter & Sort</button> */}
          </form>

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
                {filteredEncounters.length === 0 ? (
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
