import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Encounter.styles.css"; // Import your Encounter styles here
import Sidebar from "./Sidebar";
export default function Encounter() {
  const { name, date, hr, min, sec } = useParams();
  const [criminal, setCriminal] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionImage, setPredictionImage] = useState(null);
  const [isPredictionImageLoaded, setIsPredictionImageLoaded] = useState(false);
  const history = useHistory();

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

  useEffect(() => {
    axios
      .get(
        "http://localhost:3001/encounters/" +
          name +
          "/" +
          date +
          "/" +
          hr +
          "/" +
          min +
          "/" +
          sec
      )
      .then((response) => {
        setPrediction(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        "http://localhost:3001/encounters/" +
          name +
          "/" +
          date +
          "/" +
          hr +
          "/" +
          min +
          "/" +
          sec +
          "/image",
        {
          responseType: "blob",
        }
      )
      .then((response) => {
        setPredictionImage(URL.createObjectURL(response.data));
        setIsPredictionImageLoaded(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="encounter-page">
      <Sidebar />
      <div className="encounter-page-container">
        <div className="encounter-container">
          <div className="encounter-details">
            <h1>Encounter Details</h1>
            <table className="encounter-table">
              <tbody>
                <tr>
                  <td>Name:</td>
                  <td>{name}</td>
                </tr>
                <tr>
                  <td>Date:</td>
                  <td>{date}</td>
                </tr>
                <tr>
                  <td>Time:</td>
                  <td>
                    {hr}:{min}:{sec}
                  </td>
                </tr>
                {prediction != null && (
                  <tr>
                    <td>Location:</td>
                    <td>{prediction.location}</td>
                  </tr>
                )}
                {prediction != null && (
                  <tr>
                    <td>Prediction Confidence:</td>
                    <td>{prediction.confidence}</td>
                  </tr>
                )}
                {prediction != null && (
                  <tr>
                    <td>Live Camera Feed:</td>
                    <td>
                      <button
                        onClick={() => {
                          history.push("/camera/" + prediction.camera_id);
                        }}
                      >
                        Live Camera Feed
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="encounter-desc-image">
            {isPredictionImageLoaded && (
              <img
                src={predictionImage}
                height="300px"
                style={{ border: "2px solid black" }}
                alt="Criminal Image"
              />
            )}
          </div>
        </div>
        <div className="criminal-container">
          <div className="criminal-details">
            {criminal != null && (
              <>
                <h1>Predicted Criminal Details</h1>
                <table className="criminal-table">
                  <tbody>
                    <tr>
                      <td>FullName:</td>
                      <td>{criminal.fullName}</td>
                    </tr>
                    <tr>
                      <td>DOB:</td>
                      <td>
                        {new Date(criminal.dateOfBirth).getDate() +
                          "-" +
                          new Date(criminal.dateOfBirth).getMonth() +
                          "-" +
                          new Date(criminal.dateOfBirth).getFullYear()}
                      </td>
                    </tr>
                    <tr>
                      <td>Height:</td>
                      <td>{criminal.height}</td>
                    </tr>
                    <tr>
                      <td>Weight:</td>
                      <td>{criminal.weight}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>
          <div className="criminal-image">
            {isImageLoaded && (
              <img
                src={image}
                height="300px"
                style={{ border: "2px solid black" }}
                alt="Criminal Image"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
