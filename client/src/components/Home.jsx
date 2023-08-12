import  { useEffect ,useState} from "react";
import {useHistory} from "react-router-dom";
import '../styles/Auth.home.css';
import { FaHome } from 'react-icons/fa'; // Import FaHome icon
export default function Home() {

  // const cameras = ['Cam 1', 'Cam 2', 'Cam 3', 'Cam 4', 'Cam 5'];
  // const [selectedCamera, setSelectedCamera] = useState(cameras[0]);

  // const handleCameraChange = (event) => {
  //   setSelectedCamera(event.target.value);
  // };
  const [isLogged, setIsLogged] = useState(false);
  const history = useHistory();
  const handleLogin = () => {
    console.log("login");
    history.push("/login");
  }
  const handleSignUp = () => {
    console.log("signup");
    history.push("/signup");
  }
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
      console.log('token is valid')
      console.log(data)
      setIsLogged(true);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkToken(token);
    }
  }, []);
    return (


<div className="dashboard-container">
      {/* Header */}
    <header   className="header">
    <div className="logo">
          <FaHome className="home-icon" /> {/* Home Icon */}
        </div>

      <nav className="nav-links">
          {/* <div className="cameras-list">
            <span className="cameras-label">Cameras: </span>
            <select
              className="camera-select"
              value={selectedCamera}
              onChange={handleCameraChange}
            >
              {cameras.map((camera, index) => (
                <option key={index} value={camera}>
                  {camera}
                </option>
              ))}
            </select>
          </div> */}
          <a href="/allcameras" className="nav-link">
            Live Camera Feed
          </a>
          {/* <a href="/live-cam-category" className="nav-link">
            Live Cam by Category
          </a> */}
        </nav>
        </header>

    
        <div className="dashboard-content">
        <h1 className="dashboard-title">Welcome to Our Advanced Surveillance System</h1>
        <p className="dashboard-description">
          Enhancing Security with Real-time Object Detection and Facial Recognition
        </p>
        {!isLogged && <div className="dashboard-buttons">
          <button onClick={handleLogin}>Login</button>

          <p>|        |</p>
          <button onClick={handleSignUp}>Sign Up</button>
        </div>}
      </div>
    </div>

  );
    
    }