// NotificationComponent.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const NotificationComponent = () => {
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
        console.log("Notification received:", event.data);
      setNotification(event.data);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleNotify = async () => {
    try {
      const response = await axios.get("http://localhost:3001/notify");
      console.log("Notification request sent:", response.data);
    } catch (error) {
      console.error("Error sending notification request:", error);
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      <p>{notification}</p>
      <button onClick={handleNotify}>Send Notification</button>
    </div>
  );
};

export default NotificationComponent;
