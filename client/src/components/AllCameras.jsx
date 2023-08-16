import React, { useEffect, useState } from "react";
import axios from "axios";
import Video_http from "./Video_http";

export default function AllCameras() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  useEffect(() => {
    axios
      .get("http://localhost:3001/cameras")
      .then((response) => {
        for (const entry of Object.entries(response.data)) {
          setCameras((prev) => {
            for (const camera of prev) {
              if (camera[1].name === entry[1].name) {
                return prev;
              }
            }
            return [...prev, entry];
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

//   const handleCameraChange = (event) => {
//     if (event.target.value === "Select a camera") {
//       setSelectedCamera(null);
//       return;
//     }
//     const selectedCameraIndex = event.target.value.slice(0, 1);
//     for (const camera of cameras) {
//       if (camera[0] === selectedCameraIndex) {
//         setSelectedCamera(camera);
//       }
//     }
//   };

  console.log(cameras);
  console.log(selectedCamera);

  return (
    <div>
      <h1> All Cameras</h1>
      <div className="cameras-list">
        <span className="cameras-label">Cameras: </span>
        {/* <select
          className="camera-select"
          value={selectedCamera}
          onChange={handleCameraChange}
        >
          <option value={null}>Select a camera</option>
          {cameras.map((camera, index) => (
            <option key={index} value={camera}>
              {camera[1].name}
            </option>
          ))}
        </select> */}
        {/* {selectedCamera && <Video_http url={selectedCamera[1].url + "video"} />} */}
        {cameras.map((camera, index) => (
            <Video_http key={index} url={camera[1].url + "video"} index={camera[0]} />
            ))}
      </div>
    </div>
  );
}
