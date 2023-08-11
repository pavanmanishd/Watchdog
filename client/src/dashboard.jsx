import { FaHome } from 'react-icons/fa';
import  { useState } from 'react';

import { Link } from 'react-router-dom';

// import '../dashboard.css'; // Import your Dashboard CSS file
import 'C:/Users/Naveen Reddy/Desktop/hack/Hacktopia-2k23/client/src/styles/Auth.home.css';

function Dashboard() {
  const cameras = ['Cam 1', 'Cam 2', 'Cam 3', 'Cam 4', 'Cam 5'];

  const [selectedCamera, setSelectedCamera] = useState(cameras[0]);

  const handleCameraChange = (event) => {
    setSelectedCamera(event.target.value);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <FaHome className="home-icon" /> {/* Home Icon */}
        </div>

        <nav className="nav-links">
          <div className="cameras-list">
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
          </div>
          <Link to="/live-cam" className="nav-link">
            Live Cam
          </Link>
          <Link to="/live-cam-category" className="nav-link">
            Live Cam by Category
          </Link>
        </nav>
      </header>

      {/* Content */}
      <div className="dashboard-content">
        <h1 className="dashboard-title">Welcome to Our Advanced Surveillance System</h1>
        <p className="dashboard-description">
          Enhancing Security with Real-time Object Detection and Facial Recognition
        </p>

        <div className="dashboard-buttons">
          <Link to="/login" className="dashboard-button">
            Login
          </Link>
          <Link to="/signup" className="dashboard-button">
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}


export default Dashboard;
