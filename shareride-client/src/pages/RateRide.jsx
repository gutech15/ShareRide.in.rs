import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../api/imageHelper";
import "./RateRide.css";

const UserRateCard = ({ userToRate, rideId, currentUserId }) => {
  const [rating, setRating] = useState(userToRate.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(userToRate.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRated, setIsRated] = useState(userToRate.isAlreadyRated);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Molimo vas da izaberete ocenu (broj zvezdica).");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post("/Reviews", {
        rideId: rideId,
        reviewerId: currentUserId,
        revieweeId: userToRate.userId,
        rating: rating,
        comment: comment,
      });
      setIsRated(true);
    } catch (error) {
      console.error("Greška pri slanju ocene:", error);
      alert(error.response?.data || "Došlo je do greške prilikom ocenjivanja.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rate-card ${isRated ? "rated-mode" : ""}`}>
      <div className="rate-left">
        <img
          src={getImageUrl(userToRate.profilePictureUrl)}
          alt="profile"
          className="rate-profile-img"
        />
        <span className="rate-name">
          {userToRate.firstName} {userToRate.lastName}
        </span>
      </div>

      <div className="rate-right">
        <div className="star-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`star-svg ${star <= (hoverRating || rating) ? "filled" : "empty"} ${isRated ? "disabled" : ""}`}
              onClick={() => !isRated && setRating(star)}
              onMouseEnter={() => !isRated && setHoverRating(star)}
              onMouseLeave={() => !isRated && setHoverRating(0)}
              viewBox="0 0 24 24"
              width="32"
              height="32"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        <textarea
          className="comment-input"
          placeholder="Dodajte komentar..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isRated || isSubmitting}
          rows="3"
        />

        <button
          className="submit-rate-btn"
          onClick={handleSubmit}
          disabled={isRated || isSubmitting}
        >
          {isRated
            ? "Ocenili ste korisnika"
            : isSubmitting
              ? "Slanje..."
              : "Ocenite korisnika"}
        </button>
      </div>
    </div>
  );
};

const RateRide = () => {
  const { rideId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [usersToRate, setUsersToRate] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersToRate = async () => {
      try {
        const res = await axiosInstance.get(
          `/Reviews/users-to-rate/${rideId}/${user.id}`,
        );
        setUsersToRate(res.data);
      } catch (err) {
        console.error("Greška pri učitavanju korisnika za ocenjivanje:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && rideId) fetchUsersToRate();
  }, [user, rideId]);

  if (loading) return <div className="container mt-4">Učitavanje...</div>;

  return (
    <div className="rate-ride-container container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Nazad
      </button>
      <h2 className="rate-page-title">Ocenite korisnike</h2>

      <div className="rate-cards-wrapper">
        {usersToRate.length > 0 ? (
          usersToRate.map((u) => (
            <UserRateCard
              key={u.userId}
              userToRate={u}
              rideId={rideId}
              currentUserId={user.id}
            />
          ))
        ) : (
          <p className="no-users-msg">
            Nemate korisnika za ocenjivanje u ovoj vožnji.
          </p>
        )}
      </div>
    </div>
  );
};

export default RateRide;
