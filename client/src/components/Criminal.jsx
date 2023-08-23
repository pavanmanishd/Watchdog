import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Criminal.styles.css"; // Import your Criminal styles here
import Sidebar from "./Sidebar";
export default function Criminal() {
  const { name } = useParams();
  const [criminal, setCriminal] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [image, setImage] = useState(null);
  const [arrestRecords, setArrestRecords] = useState(null);
  const [chargesOffenses, setChargesOffenses] = useState(null);
  const [courtDocuments, setCourtDocuments] = useState(null);
  const [evidencePhoto, setEvidencePhoto] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/criminals/" + name)
      .then((response) => {
        setCriminal(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3001/criminals/" + name + "/image", {
        responseType: "blob",
      })
      .then((response) => {
        setImage(URL.createObjectURL(response.data));
        setIsImageLoaded(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Fetch Arrest Records PDF
  useEffect(() => {
    axios
      .get("http://localhost:3001/criminals/" + name + "/arrestRecords", {
        responseType: "blob",
      })
      .then((response) => {
        setArrestRecords(URL.createObjectURL(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Fetch Charges/Offenses PDF
  useEffect(() => {
    axios
      .get("http://localhost:3001/criminals/" + name + "/chargesOffenses", {
        responseType: "blob",
      })
      .then((response) => {
        setChargesOffenses(URL.createObjectURL(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Fetch Court Documents PDF
  useEffect(() => {
    axios
      .get("http://localhost:3001/criminals/" + name + "/courtDocuments", {
        responseType: "blob",
      })
      .then((response) => {
        setCourtDocuments(URL.createObjectURL(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Fetch Evidence Photo
  useEffect(() => {
    axios
      .get("http://localhost:3001/criminals/" + name + "/evidencePhoto", {
        responseType: "blob",
      })
      .then((response) => {
        setEvidencePhoto(URL.createObjectURL(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const renderTableRow = (label, value) => {
    if (value !== null) {
      return (
        <tr>
          <td>{label}</td>
          <td>{value}</td>
        </tr>
      );
    } else {
      return (
        <tr>
          <td>{label}</td>
          <td>N/A</td>
        </tr>
      );
    }
  };

  if (criminal != null) {
    return (
      <div className="criminal-page">
        <Sidebar />
        <div className="criminal-page-container">
          <div className="criminal-details">
            <h1>Criminal Details</h1>
            <table className="criminal-table">
              <tbody>
                {renderTableRow("Name:", criminal.fullName)}
                {renderTableRow(
                  "Date of Birth:",
                  new Date(criminal.dateOfBirth).toLocaleDateString()
                )}
                {renderTableRow("Gender:", criminal.gender)}
                {renderTableRow("Nationality:", criminal.nationality)}
                {renderTableRow(
                  "Identification Numbers:",
                  criminal.identificationNumbers
                )}
                {renderTableRow("Height:", criminal.height)}
                {renderTableRow("Weight:", criminal.weight)}
                {renderTableRow("Hair Color:", criminal.hairColor)}
                {renderTableRow("Eye Color:", criminal.eyeColor)}
                {renderTableRow(
                  "Scars, Tattoos, Birthmarks:",
                  criminal.scarsTattoosBirthmarks
                )}
                {renderTableRow("Address:", criminal.address)}
                {renderTableRow("Phone Numbers:", criminal.phoneNumbers)}
                {renderTableRow("Email Address:", criminal.emailAddress)}
                {renderTableRow("Family Members:", criminal.familyMembers)}
                {renderTableRow("Co-Conspirators:", criminal.coConspirators)}
                {renderTableRow(
                  "Description of Crimes:",
                  criminal.descriptionOfCrimes
                )}
                {renderTableRow("Modus Operandi:", criminal.modusOperandi)}
                {renderTableRow(
                  "Locations of Incidents:",
                  criminal.locationsOfIncidents
                )}
                {renderTableRow("Victim Names:", criminal.victimNames)}
                {renderTableRow(
                  "Victim Statements:",
                  criminal.victimStatements
                )}
                {renderTableRow("Additional Notes:", criminal.additionalNotes)}
              </tbody>
            </table>
          </div>
        </div>
        <div className="documents">
          <h1>Image</h1>
          <div className="criminal-desc-image">
            {isImageLoaded ? (
              <img
                src={image}
                height="300px"
                style={{ border: "2px solid black" }}
                alt="Criminal Image"
              />
            ) : (
              <p>Loading Image ...</p>
            )}
          </div>
          <br />
          <h2>Documents</h2>
          <br />
          <a href={arrestRecords} target="_blank" rel="noopener noreferrer">
            Arrest Records (PDF)
          </a>
          <br />
          <a href={chargesOffenses} target="_blank" rel="noopener noreferrer">
            Charges/Offenses (PDF)
          </a>
          <br />
          <a href={courtDocuments} target="_blank" rel="noopener noreferrer">
            Court Documents (PDF)
          </a>
          <br />
          <h2>Evidence Photo</h2>
          <img
            src={evidencePhoto}
            height="200px"
            style={{ border: "2px solid black" }}
            alt="Evidence Photo"
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="criminal-page">
        <Sidebar />
        <h1>Loading ...</h1>
      </div>
    );
  }
}
