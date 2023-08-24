import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";

export default function Search() {
  const { searchText } = useParams();
  const [criminals, setCriminals] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [images, setImages] = useState({});
  const [encounterLoading, setEncounterLoading] = useState(true);
  const [criminalLoading, setCriminalLoading] = useState(true);
  const [encounterError, setEncounterError] = useState(null);
  const [criminalError, setCriminalError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    // Reset the state when terms change
  const terms = searchText.trim().split(" ");
    setEncounters([]);
    setCriminals([]);
    setImages({});
    setEncounterLoading(true);
    setCriminalLoading(true);
    setEncounterError(null);
    setCriminalError(null);

    if (terms.length === 1 && terms[0].length <= 1) {
      setCriminalLoading(false);
      setEncounterLoading(false);
      return;
    }

    // Criminals
    if (terms.length === 1) {
      const term = terms[0];
      axios
        .get(`http://localhost:3001/criminals/search/${term}`)
        .then((response) => {
          const data = response.data;
          console.log(data);
          setCriminals(data);
          if (data.length === 0) {
            setCriminalError("No criminals found");
          }
          setCriminalLoading(false);
          data.forEach((criminal) => {
            fetchImage(criminal.fullName);
          });
        })
        .catch((error) => {
          console.error("Error fetching criminals:", error);
          setCriminalError("Error fetching data");
          setCriminalLoading(false);
        });
    } else {
      // Handle multiple terms for criminals
      const requests = terms.map((term) =>
        axios.get(`http://localhost:3001/criminals/search/${term}`)
      );

      Promise.all(requests)
        .then((responses) => {
          let allData = [];
          responses.forEach((response) => {
            const data = response.data;
            allData = [...allData, ...data];
          });

          if (allData.length === 0) {
            setCriminalError("No criminals found");
          }

          setCriminals(allData);
          setCriminalLoading(false);

          allData.forEach((criminal) => {
            fetchImage(criminal.fullName);
          });
        })
        .catch((error) => {
          console.error("Error fetching criminals:", error);
          setCriminalError("Error fetching data");
          setCriminalLoading(false);
        });
    }

    // Encounters
    if (terms.length === 1) {
      const term = terms[0];
      axios
        .get(`http://localhost:3001/encounters/search/${term}`)
        .then((response) => {
          const data = response.data;
          console.log(data);
          setEncounters(data);
          if (data.length === 0) {
            setEncounterError("No encounters found");
          }
          setEncounterLoading(false);
          data.forEach((encounter) => {
            fetchImage(encounter.name);
          });
        })
        .catch((error) => {
          console.error("Error fetching encounters:", error);
          setEncounterError("Error fetching data");
          setEncounterLoading(false);
        });
    } else {
      // Handle multiple terms for encounters
      const requests = terms.map((term) =>
        axios.get(`http://localhost:3001/encounters/search/${term}`)
      );

      Promise.all(requests)
        .then((responses) => {
          let allData = [];
          responses.forEach((response) => {
            const data = response.data;
            allData = [...allData, ...data];
          });

          if (allData.length === 0) {
            setEncounterError("No encounters found");
          }

          setEncounters(allData);
          setEncounterLoading(false);

          allData.forEach((encounter) => {
            fetchImage(encounter.name);
          });
        })
        .catch((error) => {
          console.error("Error fetching encounters:", error);
          setEncounterError("Error fetching data");
          setEncounterLoading(false);
        });
    }
  }, [searchText]);

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
    history.push(`/criminal/${criminal.fullName}`);
  };

  const Encounter = () => {
    if (encounterLoading) {
      return (
        <tr className="table-row">
          <td className="table-data" colSpan="5">
            Loading...
          </td>
        </tr>
      );
    }

    if (encounterError) {
      return (
        <tr className="table-row">
          <td className="table-data" colSpan="5">
            {encounterError}
          </td>
        </tr>
      );
    }

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
    if (criminalLoading) {
      return (
        <tr className="table-row">
          <td className="table-data" colSpan="5">
            Loading...
          </td>
        </tr>
      );
    }

    if (criminalError) {
      return (
        <tr className="table-row">
          <td className="table-data" colSpan="5">
            {criminalError}
          </td>
        </tr>
      );
    }

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
              <Criminal />
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
              <Encounter />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
