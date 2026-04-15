import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import "./CreateRide.css";

const CreateRide = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
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

    const depTime = new Date(formData.departureTime);
    const arrTime = new Date(formData.arrivalTime);

    console.log(arrTime <= depTime);

    if (arrTime <= depTime) {
      setToast({
        message: "Vreme dolaska mora biti nakon vremena polaska.",
        type: "error",
        visible: true,
      });
      setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
      return;
    }

    try {
      const payload = {
        ...formData,
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: new Date(formData.arrivalTime).toISOString(),
      };
      const response = await API.post("/rides", payload);
      console.log(response);
      const newRideId = response.data;

      setToast({
        message: "Vožnja je uspešno kreirana!",
        type: "success",
        visible: true,
      });

      setTimeout(() => {
        navigate(`/rides/${newRideId}`);
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || "Greška pri kreiranju vožnje";
      setToast({ message: errorMsg, type: "error", visible: true });

      setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
    }
  };

  return (
    <div className="create-ride-page-wrapper">
      <div className="form-main-content">
        <div className="ride-card">
          <form onSubmit={handleSubmit} className="ride-form-layout">
            <h1 className="form-title">Nova vožnja</h1>

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
                Dozvoljeno pušenje
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
                Najviše dvoje pozadi
              </label>
              <label className="checkbox-control">
                <input
                  type="checkbox"
                  name="isAutoConfirmation"
                  onChange={handleChange}
                />{" "}
                Automatska rezervacija
              </label>
            </div>

            <button type="submit" className="auth-main-btn">
              Kreiraj vožnju
            </button>
          </form>
        </div>
      </div>
      {toast.visible && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default CreateRide;
