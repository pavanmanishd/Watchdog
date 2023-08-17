import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
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
        // console.log(response.data);
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
        // console.log(response.data);
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
        console.log(response.data);
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
        // console.log(response.data);
        setPredictionImage(URL.createObjectURL(response.data));
        setIsPredictionImageLoaded(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div>
      <div>
        <div>
          <h1>Encounter Details</h1>
          <h2>Name : {name}</h2>
          <h3>Date : {date}</h3>
          <h3>
            Time : {hr}:{min}:{sec}
          </h3>
          {prediction != null && (
            // confidence camera_id
            <>
              <h2>Location : {prediction.location}</h2>
              <h3>Prediction Confidence : {prediction.confidence}</h3>
              <button
                onClick={() => {
                  history.push("/camera/" + prediction.camera_id);
                }}
              >
                Live Camera Feed
              </button>
            </>
          )}
        </div>
        {isPredictionImageLoaded && (
          <div>
            <img
              src={predictionImage}
              height="300px"
              style={{ border: "2px solid black" }}
              alt="Criminal Image"
            />
          </div>
        )}
      </div>
      <div>
        {criminal != null && (
          <>
            <h1>Predicted Criminal Details : </h1>
            <h2>Name : {criminal.name}</h2>
            <h3>Age : {criminal.age}</h3>
            <h3>Height : {criminal.height}</h3>
            <h3>Weight : {criminal.weight}</h3>
            <h3>Description : {criminal.description}</h3>
          </>
        )}
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
  );
}
