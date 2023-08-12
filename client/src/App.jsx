import "./App.css";
import { Switch, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/Signup";
import Video from "./components/Video_websocket";
import Encounters from "./components/Encounters";
import Add from "./components/Add";
import AllCameras from "./components/AllCameras";
import Video_http from "./components/Video_http";
import CriminalList from "./components/CriminalList";
import Criminal from "./components/Criminal";
function App() {
  return (
    <div>
      {/* Navbar */}
      {/* <nav>
        <a href="/">Home</a>
        <a href="/login">Login</a>
        <a href="/signup">Signup</a>
      </nav> */}
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
        {/* <Route exact path="/video/:id"> <Video /> </Route> */}
        <Route exact path="/encounters">
          <Encounters />
        </Route>
        <Route exact path="/add">
          <Add />
        </Route>
        <Route exact path="/allcameras">
          <AllCameras />
        </Route>
        <Route exact path="/video/:id" >
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
