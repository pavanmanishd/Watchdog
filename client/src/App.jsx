import React, { useEffect, useState } from "react";
import { Switch, Route ,useHistory } from "react-router-dom";
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
function App() {
  const [notifications, setNotifications] = useState([]);
  const history = useHistory();
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
      console.log("Notification received:", event.data);
      setNotifications(prev => {
        //add new notification to the top of the list
        return [JSON.parse(event.data), ...prev];
      });
    };

    return () => {
      ws.close();
    };
  }, []);
  
  const handleClick = (notification) => {
    console.log("Notification clicked:", notification);
    const time = notification.timestamp.split(" ");
    history.push(`/encounter/${notification.name}/${time[0]}/${time[1].replaceAll(":", "/")}`);
    window.location.reload();
  };
  const [isLogged, setIsLogged] = useState(false);
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
    } else {
      setIsLogged(true);
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
    <div>
      <div style={{position:"absolute", bottom:"50px",right:"50px"}}>
      {notifications.length != 0 && (
        <div>
          {notifications.map((notification, index) => (
            <div key={index} onClick={() => handleClick(notification)}>
              <p>{notification.name} was detected at {notification.timestamp} near {notification.location} at camera : {notification.camera_id}</p>
            </div>
          ))}
        </div>
      )
      }
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
        <Route exact path="/encounter/:name/:date/:hr/:min/:sec">
          <Encounter />
        </Route>
        <Route exact path="/upload">
          <Upload />
        </Route>
        <Route exact path="/cameras">
          <AllCameras />
        </Route>
        <Route exact path="/camera/:id">
          <Video_http />
        </Route>
        <Route exact path="/criminals">
          <CriminalList />
        </Route>
        <Route exact path="/criminals/:name">
          <Criminal />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
