import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
export default function Criminal() {
  const { name } = useParams();
  const [criminal, setCriminal] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [image, setImage] = useState(null);
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

  if (criminal != null) {
    return (
      <div>
        <h1>Criminal</h1>
        <h2>Name : {criminal.name}</h2>
        <h3>Age : {criminal.age}</h3>
        <h3>Height : {criminal.height}</h3>
        <h3>Weight : {criminal.weight}</h3>
        <h3>Description : {criminal.description}</h3>
        {isImageLoaded && (
          <img
            src={image}
            height="300px"
            style={{ border: "2px solid black" }}
            alt="Criminal Image"
          />
        )}
        {!isImageLoaded && <p>Loading Image ...</p>}
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
