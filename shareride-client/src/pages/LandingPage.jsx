import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            <img
              src="/ridesharelogobold.svg"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
              alt="Logo"
            ></img>
          </div>

          <div className="nav-actions">
            <button
              className="btn-text"
              onClick={() =>
                navigate("/auth", { state: { initialIsLogin: false } })
              }
            >
              Registrujte se
            </button>
            <button
              className="btn-primary"
              onClick={() =>
                navigate("/auth", { state: { initialIsLogin: true } })
              }
            >
              Prijavite se
            </button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">{/* HERO SEKCIJA, KASNIJE */}</div>
      </section>
    </div>
  );
};

export default LandingPage;
