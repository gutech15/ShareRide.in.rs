import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../api/imageHelper";
import "./RideCard.css";

const RideCard = ({ ride, requestedSeats }) => {
  const navigate = useNavigate();
  const isFull = ride.remainingSeats === 0;
  const notEnoughSeats = ride.remainingSeats < requestedSeats;

  const getDuration = (start, end) => {
    const durationMs = end - start;

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);

    if (hours === 0 && minutes === 0) return "0min";
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;

    return `${hours}h ${minutes}min`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("sr-RS", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`ride-card-dash ${isFull || notEnoughSeats ? "disabled" : ""}`}
      onClick={() => {
        if (isFull || notEnoughSeats) return;
        navigate(`/rides/${ride.id}`);
      }}
    >
      <div className="card-top">
        <div className="route-info">
          <div className="point">
            <span className="time">{formatTime(ride.departureTime)}</span>
            <span className="city">{ride.startCity}</span>
          </div>

          <div className="path-container">
            <span className="duration">
              {getDuration(ride.departureTime, ride.arrivalTime)}
            </span>
            <div className="dotted-line"></div>
          </div>

          <div className="point">
            <span className="time">{formatTime(ride.arrivalTime)}</span>
            <span className="city">{ride.endCity}</span>
          </div>
        </div>

        <div className="price-status">
          {isFull ? (
            <span className="status-text full">Popunjeno</span>
          ) : notEnoughSeats ? (
            <span className="status-text no-seats">Nedovoljno mesta</span>
          ) : (
            <span className="price">{ride.pricePerSeat} RSD</span>
          )}
        </div>
      </div>

      <div className="divider-horizontal"></div>

      <div className="card-bottom">
        <div className="driver-section">
          <img src="/rides-icon.svg" alt="car" className="car-icon" />
          <img
            src={getImageUrl(ride.driverProfilePictureUrl)}
            alt={ride.driverFirstName}
            className="driver-img"
          />
          <div className="driver-meta">
            <span className="driver-name">{ride.driverFirstName}</span>
            <div className="rating">
              <span className="star">★</span>
              <span>
                {ride.averageRating > 0
                  ? ride.averageRating.toFixed(1)
                  : "Nema ocena"}
              </span>
            </div>
          </div>

          {ride.isAutoConfirmation && (
            <div className="auto-confirm">
              <div className="vertical-line"></div>
              <span>✔ Automatska rezervacija</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideCard;
