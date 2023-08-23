import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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

  if (criminal != null) {
    return (
      <div>
        <h1>Criminal</h1>
        <h2>Name: {criminal.fullName}</h2>
        <h3>
          Date of Birth: {new Date(criminal.dateOfBirth).toLocaleDateString()}
        </h3>
        <h3>Gender: {criminal.gender}</h3>
        <h3>Nationality: {criminal.nationality}</h3>
        <h3>Identification Numbers: {criminal.identificationNumbers}</h3>
        <h3>Height: {criminal.height}</h3>
        <h3>Weight: {criminal.weight}</h3>
        <h3>Hair Color: {criminal.hairColor}</h3>
        <h3>Eye Color: {criminal.eyeColor}</h3>
        <h3>Scars, Tattoos, Birthmarks: {criminal.scarsTattoosBirthmarks}</h3>
        <h3>Address: {criminal.address}</h3>
        <h3>Phone Numbers: {criminal.phoneNumbers}</h3>
        <h3>Email Address: {criminal.emailAddress}</h3>
        <h3>Family Members: {criminal.familyMembers}</h3>
        <h3>Co-Conspirators: {criminal.coConspirators}</h3>
        <h3>Description of Crimes: {criminal.descriptionOfCrimes}</h3>
        <h3>Modus Operandi: {criminal.modusOperandi}</h3>
        <h3>Locations of Incidents: {criminal.locationsOfIncidents}</h3>
        <h3>Victim Names: {criminal.victimNames}</h3>
        <h3>Victim Statements: {criminal.victimStatements}</h3>
        <h3>Additional Notes: {criminal.additionalNotes}</h3>

        {isImageLoaded && (
          <img
            src={image}
            height="300px"
            style={{ border: "2px solid black" }}
            alt="Criminal Image"
          />
        )}
        {!isImageLoaded && <p>Loading Image ...</p>}

        {/* Display links/buttons for PDFs and Image */}
        <div>
          <h2>Documents</h2>
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
      <div>
        <h1>Loading ...</h1>
      </div>
    );
  }
}
