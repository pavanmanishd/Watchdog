import React, { useState } from "react";
import axios from "axios";

const ImageUploadComponent = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [criminalName, setCriminalName] = useState("");
  const [criminalAge, setCriminalAge] = useState("");
  const [criminalHeight, setCriminalHeight] = useState("");
  const [criminalWeight, setCriminalWeight] = useState("");
  const [criminalDescription, setCriminalDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  const handleCriminalNameChange = (event) => {
    setCriminalName(event.target.value);
  };

  const handleCriminalAgeChange = (event) => {
    setCriminalAge(event.target.value);
  };

  const handleCriminalHeightChange = (event) => {
    setCriminalHeight(event.target.value);
  };

  const handleCriminalWeightChange = (event) => {
    setCriminalWeight(event.target.value);
  };

  const handleCriminalDescriptionChange = (event) => {
    setCriminalDescription(event.target.value);
  };

  const handleUpload = async () => {
    if (
      !criminalName ||
      !criminalAge ||
      !criminalHeight ||
      !criminalWeight ||
      !criminalDescription
    ) {
      setMessage("Please provide all required information");
      return;
    }

    // send to server using websocket
    const ws = new WebSocket("ws://localhost:3001");
    ws.onopen = () => {
      console.log("WebSocket Client Connected");
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = () => {
        const base64String = reader.result
          .replace("data:", "")
          .replace(/^.+,/, "");
        const data = {
          criminalName,
          criminalAge,
          criminalHeight,
          criminalWeight,
          criminalDescription,
          image: base64String,
        };
        ws.send(JSON.stringify(data));
      };
    };
    ws.onclose = () => {
        console.log("WebSocket Client Disconnected");
    };
    setMessage(response.data.message);
  };

  return (
    <div>
      <h2>Image Upload with Criminal Details</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <input
        type="text"
        placeholder="Criminal Name"
        value={criminalName}
        onChange={handleCriminalNameChange}
      />
      <input
        type="number"
        placeholder="Criminal Age"
        value={criminalAge}
        onChange={handleCriminalAgeChange}
      />
      <input
        type="text"
        placeholder="Criminal Height"
        value={criminalHeight}
        onChange={handleCriminalHeightChange}
      />
      <input
        type="text"
        placeholder="Criminal Weight"
        value={criminalWeight}
        onChange={handleCriminalWeightChange}
      />
      <textarea
        placeholder="Criminal Description"
        value={criminalDescription}
        onChange={handleCriminalDescriptionChange}
      />
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ImageUploadComponent;
