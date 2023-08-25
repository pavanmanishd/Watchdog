import React, { useState,useEffect } from "react";
import axios from "axios";
import "../styles/Upload.styles.css";
import config from "../config";

const UploadComponent = () => {
  const [step, setStep] = useState(1);

  // Personal Information
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [identificationNumbers, setIdentificationNumbers] = useState("");

  // Physical Description
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [scarsTattoosBirthmarks, setScarsTattoosBirthmarks] = useState("");

  // Contact Information
  const [address, setAddress] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  // Legal Proceedings (PDFs)
  const [arrestRecords, setArrestRecords] = useState(null);
  const [chargesOffenses, setChargesOffenses] = useState(null);
  const [courtDocuments, setCourtDocuments] = useState(null);

  // Biometric Data (photograph)
  const [photograph, setphotograph] = useState([]);

  // Associates and Relationships
  const [familyMembers, setFamilyMembers] = useState("");
  const [coConspirators, setCoConspirators] = useState("");

  // Incident Details
  const [descriptionOfCrimes, setDescriptionOfCrimes] = useState("");
  const [modusOperandi, setModusOperandi] = useState("");
  const [locationsOfIncidents, setLocationsOfIncidents] = useState("");

  // Victim Information
  const [victimNames, setVictimNames] = useState("");
  const [victimStatements, setVictimStatements] = useState("");

  // Evidence Photos
  const [evidencePhoto, setevidencePhoto] = useState([]);

  // Additional Notes and Observations
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Message for the user
  const [message, setMessage] = useState("");

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleFileChange = (event, setter) => {
    const selectedFile = event.target.files[0];
    setter(selectedFile);
  };

  const handleImageChange = (event) => {
    setphotograph(event.target.files[0]);
  };

  const handleEvidenceImageChange = (event) => {
    setevidencePhoto(event.target.files[0]);
  };

  const handleSubmit = async () => {
    axios.post(`${config.api}/criminals`, {
      fullName,
      dateOfBirth,
      gender,
      nationality,
      identificationNumbers,
      height,
      weight,
      hairColor,
      eyeColor,
      scarsTattoosBirthmarks,
      address,
      phoneNumbers,
      emailAddress,
      familyMembers,
      coConspirators,
      descriptionOfCrimes,
      modusOperandi,
      locationsOfIncidents,
      victimNames,
      victimStatements,
      additionalNotes,
    });
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("arrestRecords", arrestRecords);
    formData.append("chargesOffenses", chargesOffenses);
    formData.append("courtDocuments", courtDocuments);
    formData.append("photograph", photograph);
    formData.append("evidencePhoto", evidencePhoto);
    await axios.post(`${config.api}/criminals/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Set the correct content type for FormData
      },
    });
    setMessage("Criminal information uploaded successfully!");
  };

  return (
    <main className="home-page">
      <div className="upload-container">
        <h2 className="upload-heading">Upload Criminal Information</h2>
        {step === 1 && (
          <div className="step-container">
            <h3 className="step-heading">Personal Information</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="text-input"
            />
            <input
              type="date"
              placeholder="Date of Birth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="text-input"
            />

            <input
              type="text"
              placeholder="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="text-input"
            />
            <input
              type="text"
              placeholder="Nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="text-input"
            />
            <input
              type="text"
              placeholder="Identification Numbers"
              value={identificationNumbers}
              onChange={(e) => setIdentificationNumbers(e.target.value)}
              className="text-input"
            />
            <div className="button-container">
              <button onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="step-container">
            <h3 className="step-heading">Physical Characteristics</h3>
            <input
              type="text"
              placeholder="Height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="text-input"
            />
            <input
              type="text"
              placeholder="Weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="text-input"
            />
            <input
              type="text"
              placeholder="Hair Color"
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
              className="text-input"
            />
            <input
              type="text"
              placeholder="Eye Color"
              value={eyeColor}
              onChange={(e) => setEyeColor(e.target.value)}
              className="text-input"
            />
            <input
              type="text"
              placeholder="Scars, Tattoos, Birthmarks"
              value={scarsTattoosBirthmarks}
              onChange={(e) => setScarsTattoosBirthmarks(e.target.value)}
              className="text-input"
            />
            <div className="button-container">
              <button onClick={prevStep} className="prev-button">
                Previous
              </button>
              <button onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="step-container">
            <h3 className="step-heading">Contact Information</h3>
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="text-input"
            />
            <input
              type="text"
              placeholder="Phone Numbers"
              value={phoneNumbers}
              onChange={(e) => setPhoneNumbers(e.target.value)}
              className="text-input"
            />
            <input
              type="text"
              placeholder="Email Address"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="text-input"
            />
            <div className="button-container">
              <button onClick={prevStep} className="prev-button">
                Previous
              </button>
              <button onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="step-container">
            <h3 className="step-heading">Legal Proceedings</h3>
            <p>Arrest Records</p>
            <label className="file-label">
              <span>Choose a PDF file</span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, setArrestRecords)}
                className="file-input"
              />
              <span className="file-selected-label"></span>
            </label>
            <p>Charges/Offenses</p>
            <label className="file-label">
              <span>Choose a PDF file</span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, setChargesOffenses)}
                className="file-input"
              />
              <span className="file-selected-label"></span>
            </label>

            <p>Court Documents</p>
            <label className="file-label">
              <span>Choose a PDF file</span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, setCourtDocuments)}
                className="file-input"
              />
              <span className="file-selected-label"></span>
            </label>
            <div className="button-container">
              <button onClick={prevStep} className="prev-button">
                Previous
              </button>
              <button onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="step-container">
            <h1 className="photo-heading">Photograph</h1>
            <label className="file-label">
              <span>Choose a Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                // multiple
                className="photo-input"
              />
              <span className="file-selected-label"></span>
            </label>
            <div className="button-container">
              <button onClick={prevStep} className="prev-button">
                Previous
              </button>
              <button onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </div>
        )}
        {step === 6 && (
          <div className="step-container">
            <h1 className="associates-heading">Associates and Relationships</h1>
            <p>Family Members and Friends</p>
            <input
              type="text"
              placeholder="Family Members and Friends"
              value={familyMembers}
              onChange={(e) => setFamilyMembers(e.target.value)}
              className="text-input"
            />
            <p>Co-conspirators</p>
            <input
              type="text"
              placeholder="Co-conspirators"
              value={coConspirators}
              onChange={(e) => setCoConspirators(e.target.value)}
              className="text-input"
            />
            <div className="button-container">
              <button onClick={prevStep} className="prev-button">
                Previous
              </button>
              <button onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </div>
        )}
        {step === 7 && (
          <div className="step-container">
            <h1 className="incident-heading">Incident Details</h1>
            <p>Crimes Committed</p>
            <textarea
              placeholder="Description of Crimes Committed"
              value={descriptionOfCrimes}
              onChange={(e) => setDescriptionOfCrimes(e.target.value)}
              className="textarea-input"
            />
            <p>Modus Operandi (Method of Operation)</p>
            <textarea
              placeholder="Modus Operandi (Method of Operation)"
              value={modusOperandi}
              onChange={(e) => setModusOperandi(e.target.value)}
              className="textarea-input"
            />
            <p>Locations of Incidents</p>
            <textarea
              placeholder="Locations of Incidents"
              value={locationsOfIncidents}
              onChange={(e) => setLocationsOfIncidents(e.target.value)}
              className="textarea-input"
            />
            <div className="button-container">
              <button onClick={prevStep} className="prev-button">
                Previous
              </button>
              <button onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </div>
        )}
        {step === 8 && (
          <div className="step-container">
            <h1 className="evidence-heading">Evidences (photograph)</h1>
            <label className="file-label">
              <span>Choose a Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleEvidenceImageChange}
                // multiple
                className="photo-input"
              />
              <span className="file-selected-label"></span>
            </label>
            <div className="button-container">
              <button onClick={prevStep} className="prev-button">
                Previous
              </button>
              <button onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </div>
        )}
        {step === 9 && (
          <div className="step-container">
            <h3 className="step-heading">Victim Information</h3>
            <p>Names of Victims</p>
            <input
              type="text"
              placeholder="Names of Victims"
              value={victimNames}
              onChange={(e) => setVictimNames(e.target.value)}
              className="text-input"
            />
            <p>Victim Statements</p>
            <input
              type="text"
              placeholder="Victim Statements"
              value={victimStatements}
              onChange={(e) => setVictimStatements(e.target.value)}
              className="text-input"
            />
            <div className="button-container">
              <button onClick={prevStep} className="prev-button">
                Previous
              </button>
              <button onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </div>
        )}
        {step === 10 && (
          <div className="step-container">
            <h3 className="step-heading">Additional Notes and Observations</h3>
            <textarea
              placeholder="Notes and Observations"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="textarea-input"
            />
            <div className="button-container">
              <button onClick={prevStep} className="prev-button">
                Previous
              </button>
              <button onClick={handleSubmit} className="submit-button">
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
      {message && <p className="message">{message}</p>}
    </main>
  );
};

export default UploadComponent;
