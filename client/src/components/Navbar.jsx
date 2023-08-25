import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../styles/Navbar.styles.css"; // Import your custom CSS file for Navbar styling
import axios from "axios";
export default function Navbar() {
  const [searchText, setSearchText] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false); // State to manage notification visibility
  const [userDetails, setUserDetails] = useState(null); // State to store user details
  const [showProfileDropdown, setShowProfileDropdown] = useState(false); // State to manage profile dropdown visibility
  const history = useHistory(); // Access the React Router history object

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    history.push(`/search/${event.target.value}`);
  };

  const handleSearchSubmit = () => {
    console.log("Search text:", searchText);
    const trimmedSearchText = searchText.trim();
    if (trimmedSearchText === "") {
      return;
    }
    const filteredSearchText = trimmedSearchText.replaceAll(" ", "%20");
    history.push(`/search/${filteredSearchText}`);
    window.location.reload();
  };
  

  const handleNotificationClick = () => {
    // Toggle the visibility of notifications when the notification icon is clicked
    setShowNotifications((prevShowNotifications) => !prevShowNotifications);
    if (showProfileDropdown) {
      // Close the profile dropdown if it is open
      setShowProfileDropdown(false);
    }
  };

  const handleProfileClick = () => {
    // Fetch user details when the profile icon is clicked
    setShowProfileDropdown(
      (prevShowProfileDropdown) => !prevShowProfileDropdown
    );
    if (showNotifications) {
      // Close the notifications if they are open
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
      console.log("Notification received:", event.data);
      setNotifications((prev) => {
        //add new notification to the top of the list
        return [JSON.parse(event.data), ...prev];
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  // Function to fetch user details
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("http://localhost:8000/user", {
          headers: {
            "x-access-token": token,
          },
        });

        if (response.status === 200) {
          const data = await response.json();
          setUserDetails(data.user); // Set user details in state
        } else {
          // Handle error
          console.error("Failed to fetch user details");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching user details:", error);
      }
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    axios
      .get("http://localhost:8000/api/logout", {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("token");
          history.push("/login");
        }
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  // Function to handle notification item click
  const handleNotificationItemClick = (notification) => {
    const { name,timestamp,location,camera_id } = notification;
    const times = timestamp.split(" "); 
    const url = `/encounter/${name}/${times[0]}/${times[1].replaceAll(":","/")}`;
    history.push(url);
    setShowNotifications(false); // Close the notifications when an item is clicked
  };

  // Function to render the user profile dropdown
  const renderUserProfile = () => {
    if (userDetails) {
      return (
        <div className="user-profile">
          <div className="username">
            {/* <strong>Username:</strong>  */}@{userDetails.username}
          </div>
          <div className="email">
            {/* <strong>Email:</strong>  */}
            {userDetails.email}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    // check if the current route is /login or /signup
  const isLoginPage = history.location.pathname === "/login" || history.location.pathname === "/login/";
  const isSignupPage = history.location.pathname === "/signup" || history.location.pathname === "/signup/";
  const isUploadPage = history.location.pathname === "/upload" || history.location.pathname === "/upload/";
  if (isLoginPage || isSignupPage) {
    // Hide the navbar if the current route is /login or /signup
    document.querySelector(".navbar-container").style.display = "none";
  } 
  if(isUploadPage){
    document.querySelector(".navbar-container").style.display = "none";
  }
}, [history.location.pathname]);

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
                    <div
                      key={index}
                      className="notification-item"
                      onClick={() => handleNotificationItemClick(notification)}
                    >
                      Suspected Encountered : {notification.name}
                    </div>
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
            {showProfileDropdown && (
              <div className="user-profile-dropdown">{renderUserProfile()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
