import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import "./CreateRide.css";

const CreateRide = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    startCity: "",
    endCity: "",
    startAddress: "",
    endAddress: "",
    departureTime: "",
    arrivalTime: "",
    availableSeats: 1,
    pricePerSeat: 0,
    allowSmoking: false,
    allowPets: false,
    maxTwoBackSeats: false,
    isAutoConfirmation: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: new Date(formData.arrivalTime).toISOString(),
      };
      await API.post("/rides", payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Greska pri kreiranju voznje");
    }
  };

  return (
    <div className="create-ride-page-wrapper">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            <img
              src="/ridesharelogobold.svg"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
              alt="Logo"
            />
          </div>
          <div className="nav-actions">
            <button className="btn-text" onClick={() => navigate("/dashboard")}>
              ← Vrati se nazad
            </button>
          </div>
        </div>
      </nav>

      <div className="form-main-content">
        <div className="ride-card">
          <form onSubmit={handleSubmit} className="ride-form-layout">
            <h1 className="form-title">Nova voznja</h1>
            {error && <div className="error-box">{error}</div>}

            <div className="form-row">
              <div className="input-group">
                <label>Grad polaska</label>
                <input name="startCity" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Grad dolaska</label>
                <input name="endCity" required onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Adresa polaska</label>
                <input
                  name="startAddress"
                  placeholder="Npr. Parking kod marketa"
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Adresa dolaska</label>
                <input
                  name="endAddress"
                  placeholder="Npr. Trg Nikole Pašića"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Vreme polaska</label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Vreme dolaska (procena)</label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Slobodna mesta</label>
                <input
                  type="number"
                  name="availableSeats"
                  min="1"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Cena po mestu (RSD)</label>
                <input
                  type="number"
                  name="pricePerSeat"
                  min="0"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="checkbox-container">
              <label className="checkbox-control">
                <input
                  type="checkbox"
                  name="allowSmoking"
                  onChange={handleChange}
                />{" "}
                Dozvoljeno pusenje
              </label>
              <label className="checkbox-control">
                <input
                  type="checkbox"
                  name="allowPets"
                  onChange={handleChange}
                />{" "}
                Dozvoljeni ljubimci
              </label>
              <label className="checkbox-control">
                <input
                  type="checkbox"
                  name="maxTwoBackSeats"
                  onChange={handleChange}
                />{" "}
                Najvise 2 pozadi
              </label>
              <label className="checkbox-control">
                <input
                  type="checkbox"
                  name="isAutoConfirmation"
                  onChange={handleChange}
                />{" "}
                Auto-potvrda
              </label>
            </div>

            <button type="submit" className="auth-main-btn">
              Kreirajte voznju
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRide;
