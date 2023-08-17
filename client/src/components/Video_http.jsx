import React, { useRef, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
export default function Video_http({ url, index }) {
  const history = useHistory();
  const { id } = useParams();
  const [URL,setURL] = React.useState(url);
  const [camera, setCamera] = React.useState(null);

  useEffect(() => {
    if (id != null) {
      axios
        .get("http://localhost:3001/cameras/" + id)
        .then((response) => {
          console.log(response.data);
          // url = response.data.url;
          setCamera(response.data);
          setURL(response.data.url+"video");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  const handleClick = () => {
    history.push("/camera/" + index);
  };

  return (
    <div>
      {camera != null && (
        <div>
          <h1>Camera Feed Viewer</h1>
          <h2>{camera.name}</h2>
          <h3>Location : {camera.location}</h3>
        </div>
      )}
      <img
        src={URL}
        width="640"
        height="480"
        style={{ border: "2px solid black" }}
        alt="Video Frame"
        onClick={() => {
          if (id == null) handleClick();
        }}
      />
    </div>
  );
}
