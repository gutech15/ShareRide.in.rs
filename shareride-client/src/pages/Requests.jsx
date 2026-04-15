import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../api/imageHelper";
import "./Requests.css";

const Requests = () => {
  const { user } = useAuthStore();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/Bookings/requests/${user.id}`);
      setIncoming(res.data.incomingRequests);
      setOutgoing(res.data.outgoingRequests);
      console.log(res.data);
    } catch (err) {
      console.error("Greška pri dohvatanju zahteva:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleAction = async (id, action) => {
    try {
      await axiosInstance.patch(
        `/Bookings/${id}/${action}`,
        JSON.stringify(user.id),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      fetchRequests();
    } catch (err) {
      alert(err.response?.data || "Došlo je do greške.");
    }
  };

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
      month: "short",
    });

  const RequestCard = ({ req, isIncoming }) => (
    <div className="request-card-row">
      <div className="col-status-actions">
        <span className={`status-tag ${req.status.toLowerCase()}`}>
          {req.status}
        </span>
        <div className="action-buttons">
          {isIncoming && req.status === "Pending" && (
            <>
              <button
                className="btn-action accept"
                onClick={() => handleAction(req.bookingId, "accept")}
              >
                Prihvati
              </button>
              <button
                className="btn-action reject"
                onClick={() => handleAction(req.bookingId, "reject")}
              >
                Odbij
              </button>
            </>
          )}
          {!isIncoming &&
            (req.status === "Pending" || req.status === "Approved") && (
              <button
                className="btn-action cancel"
                onClick={() => handleAction(req.bookingId, "cancel")}
              >
                Otkaži
              </button>
            )}
        </div>
      </div>

      <div className="col-date">
        <span className="req-date-val">{formatDate(req.departureTime)}</span>
      </div>

      <div className="col-route">
        <div className="route-mini">
          <div className="pnt">
            <span className="tm">{formatTime(req.departureTime)}</span>
            <span className="ct">{req.startCity}</span>
          </div>
          <div className="pth">
            <span className="dur">
              {getDuration(req.departureTime, req.arrivalTime)}
            </span>
            <div className="dot-line"></div>
          </div>
          <div className="pnt">
            <span className="tm">{formatTime(req.arrivalTime)}</span>
            <span className="ct">{req.endCity}</span>
          </div>
        </div>
      </div>

      <div className="col-user">
        <div className="user-info-box">
          {isIncoming ? (
            <img
              src="/pedestrian-icon.svg"
              className="type-icon"
              alt="putnik"
            />
          ) : (
            <img src="/car-icon.svg" className="type-icon" alt="auto" />
          )}
          <img
            src={getImageUrl(req.otherUserProfilePictureUrl)}
            className="user-avatar-small"
            alt="user"
          />
          <span className="user-name-label">
            {req.otherUserFirstName} {req.otherUserLastName}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-50 text-center">Učitavanje...</div>;

  return (
    <div className="requests-container container">
      <h2 className="section-title">Primljeni zahtevi (Ti si vozač)</h2>
      {incoming.length > 0 ? (
        incoming.map((r) => (
          <RequestCard key={r.bookingId} req={r} isIncoming={true} />
        ))
      ) : (
        <p className="empty-msg">Nema primljenih zahteva.</p>
      )}

      <h2 className="section-title" style={{ marginTop: "40px" }}>
        Poslati zahtevi (Ti si putnik)
      </h2>
      {outgoing.length > 0 ? (
        outgoing.map((r) => (
          <RequestCard key={r.bookingId} req={r} isIncoming={false} />
        ))
      ) : (
        <p className="empty-msg">Nema poslatih zahteva.</p>
      )}
    </div>
  );
};

export default Requests;
