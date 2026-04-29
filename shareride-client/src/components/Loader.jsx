import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Učitavanje podataka...</p>
    </div>
  );
};

export default Loader;
