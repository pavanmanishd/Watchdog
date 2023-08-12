import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

export default function CriminalList() {
  const [criminals, setCriminals] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:3001/criminals")
      .then((response) => {
        setCriminals(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const history = useHistory();
  const handleClick = (name) => {
    history.push("/criminals/" + name);
  };

  const CriminalsList = () => {
    return (
      <div>
        {criminals.map((criminal, index) => (
          <div key={index} onClick={() => handleClick(criminal.name)}>
            <h4>Name : {criminal.name}</h4>
            <span>Age : {criminal.age} </span>
            <span>Height : {criminal.height} </span>
            <span>Weight : {criminal.weight} </span>
            <span>Description : {criminal.description}</span>
            <hr />
          </div>
        ))}
      </div>
    );
  };
  return (
    <div style={{ height: "100%", width: "100vw" }}>
      <h2>All Criminals</h2>
      <hr />
      <CriminalsList />
    </div>
  );
}
