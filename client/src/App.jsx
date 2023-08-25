import React, { useEffect, useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/Signup";
import EncounterList from "./components/EncounterList";
import Encounter from "./components/Encounter";
import Upload from "./components/Upload";
import AllCameras from "./components/AllCameras";
import Video_http from "./components/Video_http";
import CriminalList from "./components/CriminalList";
import Criminal from "./components/Criminal";
import NotificationPopup from "./components/NotificationPopup";
import Navbar from "./components/Navbar";

import "./styles/NotificationPopup.styles.css";
import Search from "./components/Search";
import Sidebar from "./components/Sidebar";
import "./App.styles.css"

function App() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
      console.log("Notification received:", event.data);
      const notification = JSON.parse(event.data);
      console.log(notification)
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      setShowNotifications((prevShowNotifications) => [
        notification,
        ...prevShowNotifications,
      ]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleCloseNotification = (notification) => {
    setShowNotifications((prevShowNotifications) =>
      prevShowNotifications.filter((item) => item !== notification)
    );
  };

  const handleClick = (notification) => {
    const time = notification.timestamp.split(" ");
    history.push(
      `/encounter/${notification.name}/${time[0]}/${time[1].replaceAll(":", "/")}`
    );
    window.location.reload();
  };

  const checkToken = async (token) => {
    const res = await fetch("http://localhost:8000/api/token", {
      headers: {
        "x-access-token": token,
      },
    });
    const data = await res.json();
    if (data.status === false) {
      localStorage.removeItem("token");
      history.push("/login");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkToken(token);
    } else {
      history.push("/login");
    }
  }, []);

  return (
    <div className="app-page">
      <Navbar />
      <Sidebar />
      <div>
        {showNotifications.map((notification, index) => (
          <NotificationPopup
            key={index}
            notification={notification}
            onClose={() => handleCloseNotification(notification)}
            onClick={() => handleClick(notification)}
          />
        ))}
      </div>

      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/signup">
          <SignUp />
        </Route>
        <Route exact path="/encounters">
          <EncounterList />
        </Route>
        <Route
          exact
          path="/encounter/:name/:date/:hr/:min/:sec"
          component={Encounter}
        />
        <Route exact path="/upload">
          <Upload />
        </Route>
        <Route exact path="/cameras" component={AllCameras} />
        <Route exact path="/camera/:id" component={Video_http} />
        <Route exact path="/criminals" component={CriminalList} />
        <Route exact path="/criminals/:name" component={Criminal} />
        <Route exact path="/search/:searchText" component={Search} />
      </Switch>
    </div>
  );
}

export default App;
