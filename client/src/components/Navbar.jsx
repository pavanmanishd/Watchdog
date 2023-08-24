import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../styles/Navbar.styles.css"; // Import your custom CSS file for Navbar styling

export default function Navbar() {
  const [searchText, setSearchText] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false); // State to manage notification visibility
  const history = useHistory(); // Access the React Router history object

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleSearchSubmit = () => {
    alert("Search for: " + searchText);
  };

  const handleNotificationClick = () => {
    // Toggle the visibility of notifications when the notification icon is clicked
    setShowNotifications((prevShowNotifications) => !prevShowNotifications);
  };

  const handleProfileClick = () => {
    alert("Profile button clicked");
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
      console.log("Notification received:", event.data);
      const notification = JSON.parse(event.data);
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const NotificationItem = ({ notification, onClick }) => (
    <div
      className="notification-item" // Add this class for styling
      onClick={() => {
        onClick(notification);
      }}
    >
      {notification.message}
    </div>
  );

  const handleNotificationItemClick = (notification) => {
    const { encounterName, date, time } = notification;
    const url = `/encounter/${encounterName}/${date}/${time}`;
    history.push(url);
    setShowNotifications(false); // Close the notifications when an item is clicked
  };

  return (
    <div className="navbar-container">
      <div className="navbar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search.."
            name="search"
            value={searchText}
            onChange={handleSearchChange}
          />
          <button type="submit" onClick={handleSearchSubmit}>
            <i className="fa fa-search"></i>
          </button>
        </div>
        <div className="right-icons">
          <div className="notification-container">
            <button
              className="notification-button"
              onClick={handleNotificationClick}
            >
              <i className="fa fa-bell"></i>
              {notifications.length > 0 && (
                <span className="notification-count">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <NotificationItem
                      key={index}
                      notification={notification}
                      onClick={handleNotificationItemClick}
                    />
                  ))
                ) : (
                  <div className="no-notifications">No notifications</div>
                )}
              </div>
            )}
          </div>
          <div className="profile-container">
            <button className="profile-button" onClick={handleProfileClick}>
              <i className="fa fa-user"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
