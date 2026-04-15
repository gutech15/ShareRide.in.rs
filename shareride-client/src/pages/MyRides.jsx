import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../api/imageHelper";
import "./MyRides.css";

const MyRides = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeRides, setActiveRides] = useState([]);
  const [archivedRides, setArchivedRides] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await axiosInstance.get(
          `/Rides/my-rides/${user.id}?status=active`,
        );
        setActiveRides(res.data);
      } catch (err) {
        console.error("Greška kod aktivnih vožnji:", err);
      } finally {
        setLoadingActive(false);
      }
    };
    if (user) fetchActive();
  }, [user]);

  const getDuration = (start, end) => {
    const durationMs = new Date(end) - new Date(start);

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);

    if (hours === 0 && minutes === 0) return "0min";
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;

    return `${hours}h ${minutes}min`;
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("sr-RS", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("sr-Latn-RS", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const toggleArchive = async () => {
    if (!isArchivedOpen && archivedRides.length === 0) {
      setLoadingArchived(true);
      try {
        const res = await axiosInstance.get(
          `/Rides/my-rides/${user.id}?status=archived`,
        );
        setArchivedRides(res.data);
      } catch (err) {
        console.error("Greška kod arhive:", err);
      } finally {
        setLoadingArchived(false);
      }
    }
    setIsArchivedOpen(!isArchivedOpen);
  };

  const MyRideCard = ({ ride }) => {
    const handleCardClick = () => {
      navigate(`/rides/${ride.rideId}`);
    };

    const handleRateClick = (e) => {
      e.stopPropagation();
      navigate(`/rate-ride/${ride.rideId}`);
    };

    return (
      <div
        className="my-ride-card"
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >
        <div className="mr-row-1">
          <span className="mr-date">{formatDate(ride.departureTime)}</span>
          {ride.status === "Cancelled" && (
            <span className="badge-cancelled">Otkazano</span>
          )}
          {ride.canRate && (
            <button className="mr-rate-btn" onClick={handleRateClick}>
              Oceni
            </button>
          )}
        </div>

        <div className="mr-row-2">
          <div className="mr-point">
            <span className="mr-time">
              {formatTime(ride.departureTime + "z")}
            </span>
            <span className="mr-city">{ride.startCity}</span>
          </div>
          <div className="mr-path">
            <span className="mr-duration">
              {getDuration(ride.departureTime, ride.arrivalTime)}
            </span>
            <div className="mr-dotted-line"></div>
          </div>
          <div className="mr-point">
            <span className="mr-time">{formatTime(ride.arrivalTime)}</span>
            <span className="mr-city">{ride.endCity}</span>
          </div>
        </div>

        <div className="mr-divider"></div>

        <div className="mr-row-3">
          <div className="mr-driver-info">
            <img src="/car-icon.svg" alt="car" className="mr-car-icon" />
            <img
              src={getImageUrl(ride.driverProfilePictureUrl)}
              alt="driver"
              className="mr-driver-img"
            />
            <span className="mr-driver-name">
              {ride.driverFirstName} {ride.driverLastName}
              {ride.isDriver && <span className="mr-self-tag">(Ti voziš)</span>}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="my-rides-container container">
      <h2 className="section-label">Aktivne vožnje</h2>
      {loadingActive ? (
        <p>Učitavanje...</p>
      ) : activeRides.length > 0 ? (
        activeRides.map((r) => <MyRideCard key={r.rideId} ride={r} />)
      ) : (
        <p className="empty-msg">Nemate aktivnih vožnji.</p>
      )}

      <div
        className={`archive-accordion ${isArchivedOpen ? "open" : ""}`}
        onClick={toggleArchive}
      >
        <span>Arhivirane vožnje</span>
        <svg
          className="arrow-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isArchivedOpen && (
        <div className="archive-content">
          {loadingArchived ? (
            <p>Učitavanje arhive...</p>
          ) : archivedRides.length > 0 ? (
            archivedRides.map((r) => <MyRideCard key={r.rideId} ride={r} />)
          ) : (
            <p className="empty-msg">Arhiva je prazna.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRides;
