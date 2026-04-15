import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../api/imageHelper";
import "./UserRatings.css";

const UserRatings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("received");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axiosInstance.get(`/Users/${id}/ratings`);
        setData(response.data);
      } catch (error) {
        console.error("Greška pri učitavanju ocena:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [id]);

  if (isLoading)
    return <div className="loading-state">Učitavanje ocena...</div>;
  if (!data) return <div className="error-state">Nema podataka o ocenama.</div>;

  const currentSection = activeTab === "received" ? data.received : data.given;

  const getLabelForRating = (rating) => {
    const labels = {
      5: "Odličan",
      4: "Dobar",
      3: "U redu",
      2: "Razočaravajući",
      1: "Veoma razočaravajući",
    };
    return labels[rating];
  };

  return (
    <div className="ratings-page-container">
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Dobijene ocene
        </button>
        <button
          className={`tab-btn ${activeTab === "given" ? "active" : ""}`}
          onClick={() => setActiveTab("given")}
        >
          Date ocene
        </button>
      </div>

      <div className="stats-container">
        <div className="avg-rating">{currentSection.averageRating} / 5</div>
        <div className="ratings-count">
          Broj ocena: {currentSection.totalCount}
        </div>

        <div className="distribution-list">
          {[5, 4, 3, 2, 1].map((num) => (
            <div key={num} className="distribution-row">
              <span>{getLabelForRating(num)}</span>
              <strong>{currentSection.distribution[num]}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="ratings-list">
        {currentSection.ratings.length === 0 ? (
          <p className="no-ratings-text">Nema ocena u ovoj kategoriji.</p>
        ) : (
          currentSection.ratings.map((rating, index) => (
            <div key={index} className="rating-card">
              <div
                className="rating-header"
                onClick={() => navigate(`/profile/${rating.userId}`)}
              >
                <img
                  src={getImageUrl(rating.userImageUrl)}
                  alt={rating.userName}
                  className="rating-avatar"
                />
                <strong className="user-name">{rating.userName}</strong>
              </div>

              <div className="rating-body">
                <div className="stars-container">
                  {"★".repeat(rating.rating)}
                  {"☆".repeat(5 - rating.rating)}
                </div>
                <p className="rating-comment">{rating.comment}</p>
                <div className="rating-date">{rating.dateLabel}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserRatings;
