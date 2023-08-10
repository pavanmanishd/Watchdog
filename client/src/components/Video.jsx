import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import config from "../config/index";

const Video = () => {
  const videoFrameRef = useRef(null);
  const { id } = useParams();
  const websocket_url = config.streaming;

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const socket = new WebSocket(websocket_url);
        await new Promise((resolve) => (socket.onopen = resolve));

        socket.onmessage = (event) => {
          const frameBase64 = event.data;
          const img = videoFrameRef.current;

          if (img) {
            img.src = "data:image/jpeg;base64," + frameBase64;
          }
        };

        return () => {
          socket.close();
        };
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    };

    connectWebSocket();
  }, [websocket_url]);

  return (
    <div>
      <h1>Camera Feed Viewer</h1>
      <img
        ref={videoFrameRef}
        width="640"
        height="480"
        style={{ border: "2px solid black" }}
        alt="Video Frame"
      />
    </div>
  );
};

export default Video;
