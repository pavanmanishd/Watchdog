import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";

export default function Search() {
  const { searchText } = useParams();
  const terms = searchText.trim().split(" ");
  const [criminals, setCriminals] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [images, setImages] = useState({});
  const [encounterState, setEncounterState] = useState(true); // Initialize as true (loading)
  const [criminalState, setCriminalState] = useState(true); // Initialize as true (loading)
  const history = useHistory();

  useEffect(() => {
    if (terms.length === 1 && terms[0].length <= 1) {
      setCriminalState("No criminals found");
      setEncounterState("No encounters found");
      return;
    } else if (terms.length === 1 && terms[0] === "") {
      setCriminalState("No criminals found");
      setEncounterState("No encounters found");
      return;
    } else if (terms.length === 1 && terms[0] === " ") {
      setCriminalState("No criminals found");
      setEncounterState("No encounters found");
      return;
    } else if (terms.length === 1) {
      const term = terms[0];
      axios
        .get(`http://localhost:3001/criminals/search/${term}`)
        .then((response) => {
          const data = response.data;
          console.log(data);
          setCriminals(data);
          if (data.length === 0) {
            setCriminalState("No criminals found");
          } else {
            setCriminalState(false); // Set it to false after data is loaded
            data.forEach((criminal) => {
              fetchImage(criminal.fullName);
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching criminals:", error);
          setCriminalState("Error fetching data"); // Handle error state
        });
    } else {
      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        axios
          .get(`http://localhost:3001/criminals/search/${term}`)
          .then((response) => {
            const data = response.data;
            console.log(data);
            setCriminals((prevCriminals) => [...prevCriminals, ...data]);
            if (data.length === 0) {
              setCriminalState("No criminals found");
            } else {
              setCriminalState(false); // Set it to false after data is loaded
              data.forEach((criminal) => {
                fetchImage(criminal.fullName);
              });
            }
          })
          .catch((error) => {
            console.error("Error fetching criminals:", error);
            setCriminalState("Error fetching data"); // Handle error state
          });
      }
    }
  }, []);

  useEffect(() => {
    if (terms.length === 1 && terms[0].length <= 1) {
      setCriminalState("No criminals found");
      setEncounterState("No encounters found");
      return;
    } else if (terms.length === 1 && terms[0] === "") {
      setCriminalState("No criminals found");
      setEncounterState("No encounters found");
      return;
    } else if (terms.length === 1 && terms[0] === " ") {
      setCriminalState("No criminals found");
      setEncounterState("No encounters found");
      return;
    } else if (terms.length === 1) {
      const term = terms[0];
      axios
        .get(`http://localhost:3001/encounters/search/${term}`)
        .then((response) => {
          const data = response.data;
          console.log(data);
          setEncounters(data);
          if (data.length === 0) {
            setEncounterState("No encounters found");
          } else {
            setEncounterState(false); // Set it to false after data is loaded
            data.forEach((encounter) => {
              fetchImage(encounter.name);
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching encounters:", error);
          setEncounterState("Error fetching data"); // Handle error state
        });
    } else {
      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        axios
          .get(`http://localhost:3001/encounters/search/${term}`)
          .then((response) => {
            const data = response.data;
            setEncounters((prevEncounters) => [...prevEncounters, ...data]);
            if (data.length === 0) {
              setEncounterState("No encounters found");
            } else {
              setEncounterState(false); // Set it to false after data is loaded
              data.forEach((encounter) => {
                fetchImage(encounter.name);
              });
            }
          })
          .catch((error) => {
            console.error("Error fetching encounters:", error);
            setEncounterState("Error fetching data"); // Handle error state
          });
      }
    }
  }, []);

  const fetchImage = async (name) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/criminals/${name}/image`,
        {
          responseType: "blob",
        }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setImages((prevImages) => ({
        ...prevImages,
        [name]: imageUrl,
      }));
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleEncounterClick = (encounter) => {
    const time = encounter.timestamp.split(" ");
    history.push(
      `/encounter/${encounter.name}/${time[0]}/${time[1].replaceAll(":", "/")}`
    );
  };

  const handleCriminalClick = (criminal) => {
    history.push(`/criminal/${criminal.name}`);
  };

  const Encounter = () => {
    return (
      <>
        {encounters.map((encounter, index) => {
          return (
            <tr
              key={index}
              className="table-row"
              onClick={() => handleEncounterClick(encounter)}
            >
              <td className="table-data">
                {images[encounter.name] ? (
                  <img
                    src={images[encounter.name]}
                    alt={`Photo ${encounter.name}`}
                    className="encounter-image"
                  />
                ) : (
                  <div className="encounter-image-placeholder"></div>
                )}
              </td>
              <td className="table-data">{encounter.name}</td>
              <td className="table-data">{encounter.timestamp}</td>
              <td className="table-data">{encounter.location}</td>
              <td className="table-data">{encounter.camera_id}</td>
            </tr>
          );
        })}
      </>
    );
  };

  const Criminal = () => {
    return (
      <>
        {criminals.map((criminal, index) => {
          return (
            <tr
              key={index}
              className="table-row"
              onClick={() => handleCriminalClick(criminal)}
            >
              <td className="table-data">
                {images[criminal.fullName] ? (
                  <img
                    src={images[criminal.fullName]}
                    alt={`Photo ${criminal.fullName}`}
                    className="criminal-image"
                  />
                ) : (
                  <div className="criminal-image-placeholder"></div>
                )}
              </td>
              <td className="table-data">{criminal.fullName}</td>
              <td className="table-data">{criminal.dateOfBirth}</td>
              <td className="table-data">{criminal.height}</td>
              <td className="table-data">{criminal.weight}</td>
            </tr>
          );
        })}
      </>
    );
  };

  return (
    <div>
      <div className="search-container">
        <div className="search-criminal-container">
          <h2 className="search-criminal-title">Criminals</h2>
          <table className="search-criminal-table">
            <thead>
              <tr className="table-row">
                <th className="table-header">Photo</th>
                <th className="table-header">Name</th>
                <th className="table-header">Date of Birth</th>
                <th className="table-header">Height</th>
                <th className="table-header">Weight</th>
              </tr>
            </thead>
            <tbody>
              {criminalState === true ? (
                <tr className="table-row">
                  <td className="table-data" colSpan="5">
                    Loading...
                  </td>
                </tr>
              ) : criminalState === "No criminals found" ? (
                <tr className="table-row">
                  <td className="table-data" colSpan="5">
                    No criminals found
                  </td>
                </tr>
              ) : (
                <Criminal />
              )}
            </tbody>
          </table>
        </div>
        <div className="search-encounter-container">
          <h2 className="search-encounter-title">Encounters</h2>
          <table className="search-encounter-table">
            <thead>
              <tr className="table-row">
                <th className="table-header">Photo</th>
                <th className="table-header">Name</th>
                <th className="table-header">Timestamp</th>
                <th className="table-header">Location</th>
                <th className="table-header">Camera ID</th>
              </tr>
            </thead>
            <tbody>
              {encounterState === true ? (
                <tr className="table-row">
                  <td className="table-data" colSpan="5">
                    Loading...
                  </td>
                </tr>
              ) : encounterState === "No encounters found" ? (
                <tr className="table-row">
                  <td className="table-data" colSpan="5">
                    No encounters found
                  </td>
                </tr>
              ) : (
                <Encounter />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
