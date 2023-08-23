import React, { useEffect } from "react";
import "../styles/NotificationPopup.styles.css";

const NotificationPopup = ({ notification, onClose, onClick }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 10000);

    return () => {
      clearTimeout(timeout);
    };
  }, [onClose]);

  return (
    <div className="notification-popup" onClick={onClick}>
      <p>
        {notification.name} was detected at {notification.timestamp} near{" "}
        {notification.location} at camera: {notification.camera_id}
      </p>
    </div>
  );
};

export default NotificationPopup;
