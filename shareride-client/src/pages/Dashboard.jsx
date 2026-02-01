import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import "./LandingPage.css";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Niste prijavljeni.</h2>
        <button className="btn-primary" onClick={() => navigate("/auth")}>
          Idi na prijavu
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            <img src="/ridesharelogobold.svg" alt="Logo" />
          </div>
          <div className="nav-actions">
            <button className="btn-text" onClick={handleLogout}>
              Odjavi se
            </button>
          </div>
        </div>
      </nav>

      <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "20px" }}>Dobrodošli, {user.firstName}!</h1>

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            border: "1px solid #eee",
          }}
        >
          <h3 style={{ marginBottom: "15px", color: "#057fff" }}>
            Vasi podaci (UserDto):
          </h3>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Ime:</strong> {user.firstName}
          </p>
          <p>
            <strong>Prezime:</strong> {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p
            style={{
              marginTop: "15px",
              fontSize: "0.8rem",
              color: "#888",
              wordBreak: "break-all",
            }}
          >
            <strong>JWT Token:</strong> <br />
            {user.token}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
