import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRideStore } from "../store/useRideStore";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../api/imageHelper";
import "./RideDetails.css";

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { searchParams } = useRideStore();
  const { user } = useAuthStore();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const requestedSeats = searchParams.seats || 1;

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const fetchRideDetails = async () => {
    try {
      setLoading(true);

      const rideResponse = await axiosInstance.get(`/Rides/${id}`);
      const data = rideResponse.data;

      const formattedRide = {
        ...data,
        departureTime: new Date(data.departureTime + "Z"),
        arrivalTime: new Date(data.arrivalTime + "Z"),
      };

      console.log("Formatirana vožnja:", formattedRide);

      setRide(formattedRide);
    } catch (error) {
      console.error("Greška pri dohvatanju podataka:", error);
      showToastNotification("Neuspešno učitavanje podataka o vožnji.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRideDetails();
  }, [id, user]);

  const showToastNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const isMoreThanOneHourBefore = () => {
    if (!ride) return false;
    const departureTime = new Date(ride.departureTime);
    const now = new Date();
    return (departureTime - now) / (1000 * 60 * 60) > 1;
  };

  const handleErrorNotification = (error, defaultMsg) => {
    const serverMsg =
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.response?.data?.message;
    showToastNotification(serverMsg || defaultMsg, "error");
  };

  const handleBooking = async () => {
    if (!user) {
      showToastNotification(
        "Morate biti ulogovani da biste rezervisali vožnju.",
        "error",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await axiosInstance.post("/Bookings", {
        rideId: ride.id,
        passengerId: user.id,
        seatsReserved: requestedSeats,
      });

      showToastNotification(
        ride.isAutoConfirmation
          ? "Rezervacija je uspešna!"
          : "Zahtev uspešno poslat!",
        "success",
      );

      if (ride.isAutoConfirmation) {
        await fetchRideDetails();
      } else {
        navigate("/requests");
      }
    } catch (error) {
      handleErrorNotification(error, "Došlo je do neočekivane greške.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmModal = (title, message, onConfirmAction) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: onConfirmAction,
    });
  };

  const handleCancelRide = () => {
    openConfirmModal(
      "Otkaži vožnju?",
      "Ova akcija je nepovratna. Svi putnici će biti automatski obavešteni o otkazivanju.",
      async () => {
        try {
          setIsSubmitting(true);
          await axiosInstance.post(`/Rides/${id}/cancel`);
          showToastNotification("Vožnja je uspešno otkazana.", "success");
          navigate("/my-rides");
        } catch (error) {
          handleErrorNotification(error, "Greška pri otkazivanju vožnje.");
        } finally {
          setIsSubmitting(false);
        }
      },
    );
  };

  const handleCancelBooking = () => {
    openConfirmModal(
      "Otkaži rezervaciju?",
      "Da li ste sigurni da želite da odustanete od ove vožnje?",
      async () => {
        try {
          setIsSubmitting(true);
          await axiosInstance.patch(
            `/Bookings/${ride.currentUserBookingId}/cancel`,
            `"${user.id}"`,
            { headers: { "Content-Type": "application/json" } },
          );
          showToastNotification("Rezervacija uspešno otkazana.", "success");
          await fetchRideDetails(); // Osvežavanje podataka na istoj stranici
        } catch (error) {
          handleErrorNotification(error, "Greška pri otkazivanju rezervacije.");
        } finally {
          setIsSubmitting(false);
        }
      },
    );
  };

  const handleContactDriver = () => {
    if (!user) {
      showToastNotification(
        "Morate biti ulogovani da biste kontaktirali vozača.",
        "error",
      );
      return;
    }
    if (isDriver) {
      showToastNotification(
        "Ovo je vaša vožnja. Ne možete započeti čet sa samim sobom.",
        "info",
      );
      return;
    }
    navigate(`/chat/${ride.driverId}`, { state: { fullName: driverFullName } });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("sr-Latn-RS", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("sr-Latn-RS", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  if (loading)
    return <div className="p-50 text-center">Učitavanje detalja...</div>;
  if (!ride)
    return <div className="p-50 text-center">Vožnja nije pronađena.</div>;

  const driverFullName = `${ride.driverFirstName} ${ride.driverLastName}`;
  const driverRating =
    ride.driverAverageRating > 0
      ? `${ride.driverAverageRating.toFixed(1)} / 5.0`
      : "Nema ocena";
  const driverImage = getImageUrl(ride.driverProfilePictureUrl);

  const totalPrice = requestedSeats * ride.pricePerSeat;

  const isDriver = user?.id === ride.driverId;
  const isRideCancelled = ride.status === "Cancelled" || ride.status === 2;
  const canCancelTime = isMoreThanOneHourBefore();

  return (
    <div className="ride-details-page container">
      <h1 className="page-title">Detalji vožnje</h1>

      <div className="ride-details-layout">
        <div className="left-panel">
          <div className="left-top-section card-box">
            <div className="route-grid">
              <div className="grid-timeline">
                <div className="dot top-dot"></div>
                <div className="line"></div>
              </div>
              <div className="grid-time">
                <strong>{formatTime(ride.departureTime)}</strong>
              </div>
              <div className="grid-location">
                <h3 className="city-name">{ride.startCity}</h3>
                <p className="street-name">{ride.startAddress}</p>
              </div>

              <div className="grid-timeline">
                <div className="dot bottom-dot"></div>
              </div>
              <div className="grid-time">
                <strong>{formatTime(ride.arrivalTime)}</strong>
              </div>
              <div className="grid-location">
                <h3 className="city-name">{ride.endCity}</h3>
                <p className="street-name street-name-last">
                  {ride.endAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="left-middle-section card-box">
            <div
              className="driver-info-header"
              onClick={() => navigate(`/profile/${ride.driverId}`)}
            >
              <img src={driverImage} alt="Profil" className="driver-avatar" />
              <div className="driver-text-info">
                <div className="driver-name">{driverFullName}</div>
                <div className="driver-rating">
                  <span className="star-icon">{"★"}</span>{" "}
                  <span className="driver-rating-value">{driverRating}</span>
                </div>
              </div>
            </div>
            <div className="ride-amenities-list">
              {ride.isAutoConfirmation && (
                <div className="amenity-item">
                  <img
                    src="/autoconfirmation.svg"
                    alt="Auto"
                    className="amenity-icon-svg"
                  />
                  <span>Automatska rezervacija</span>
                </div>
              )}

              {ride.maxTwoBackSeats && (
                <div className="amenity-item">
                  <img
                    src="/max2.svg"
                    alt="Max 2"
                    className="amenity-icon-svg"
                  />
                  <span>Najviše dvoje na zadnjem sedištu</span>
                </div>
              )}

              <div className="amenity-item">
                <img src="/pets.svg" alt="Pets" className="amenity-icon-svg" />
                <span>
                  {ride.allowPets ? (
                    "Ljubimci su dozvoljeni"
                  ) : (
                    <>
                      <strong>Nisu</strong> dozvoljeni ljubimci
                    </>
                  )}
                </span>
              </div>

              <div className="amenity-item">
                <img
                  src="/cigarette.svg"
                  alt="Smoking"
                  className="amenity-icon-svg"
                />
                <span>
                  {ride.allowSmoking ? (
                    "Dozvoljeno pušenje"
                  ) : (
                    <>
                      <strong>Zabranjeno</strong> pušenje
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="contact-action-area">
              {!isDriver && (
                <button
                  className="btn-contact-driver"
                  onClick={handleContactDriver}
                >
                  Kontaktirajte sa {ride.driverFirstName}
                </button>
              )}
            </div>
          </div>

          <div className="left-bottom-section card-box">
            <h3 className="section-subtitle">Putnici</h3>

            {!ride.passengers || ride.passengers.length === 0 ? (
              <p className="no-passengers-msg">Još uvek nema putnika</p>
            ) : (
              <div className="passengers-list">
                {ride.passengers.map((passenger) => (
                  <div
                    key={passenger.id}
                    className="passenger-item"
                    onClick={() => navigate(`/profile/${passenger.id}`)}
                  >
                    <img
                      src={getImageUrl(passenger.profilePictureUrl)}
                      alt={`Putnik ${passenger.firstName}`}
                      className="passenger-avatar"
                    />
                    <div className="passenger-text-info">
                      <div className="passenger-name">
                        {passenger.firstName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="right-panel">
          <div className="card-box sticky-sidebar">
            <div className="sidebar-summary">
              <div className="sidebar-date">
                {formatDateLong(ride.departureTime)}
              </div>

              <div className="route-grid">
                <div className="grid-timeline">
                  <div className="dot top-dot"></div>
                  <div className="line"></div>
                </div>
                <div className="grid-time">
                  <strong>{formatTime(ride.departureTime)}</strong>
                </div>
                <div className="grid-location">
                  <h3 className="city-name">{ride.startCity}</h3>
                  <p className="street-name">{ride.startAddress}</p>
                </div>

                <div className="grid-timeline">
                  <div className="dot bottom-dot"></div>
                </div>
                <div className="grid-time">
                  <strong>{formatTime(ride.arrivalTime)}</strong>
                </div>
                <div className="grid-location">
                  <h3 className="city-name">{ride.endCity}</h3>
                  <p className="street-name street-name-last">
                    {ride.endAddress}
                  </p>
                </div>
              </div>

              <div className="mini-driver">
                <img src={driverImage} alt="Vozac" className="mini-avatar" />
                <div className="mini-driver-name">{driverFullName}</div>
              </div>
            </div>

            <div className="sidebar-pricing">
              <div className="price-row">
                <span>Broj mesta: {requestedSeats}</span>
                <span className="total-price-val">{totalPrice} RSD</span>
              </div>
            </div>

            <div className="sidebar-action">
              {isRideCancelled ? (
                <div className="status-badge cancelled">Vožnja je otkazana</div>
              ) : isDriver ? (
                canCancelTime ? (
                  <button
                    className="btn-cancel-ride"
                    onClick={handleCancelRide}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Obrada..." : "Otkaži vožnju"}
                  </button>
                ) : (
                  <div className="info-box">
                    Otkazivanje više nije moguće (manje od 1h do polaska)
                  </div>
                )
              ) : ride.currentUserBookingStatus === "Approved" ||
                ride.currentUserBookingStatus === "Pending" ? (
                canCancelTime ? (
                  <button
                    className="btn-cancel-booking"
                    onClick={handleCancelBooking}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Obrada..." : "Otkaži rezervaciju"}
                  </button>
                ) : (
                  <div className="info-box">Kasno je za otkazivanje.</div>
                )
              ) : ride.currentUserBookingStatus === "CancelledByPassenger" ||
                ride.currentUserBookingStatus === "Rejected" ? (
                <div className="info-box">
                  Tvoj zahtev je otkazan ili odbijen.
                </div>
              ) : (
                <button
                  className="btn-reserve-full"
                  onClick={handleBooking}
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting
                    ? "Obrada..."
                    : ride.isAutoConfirmation
                      ? "Rezerviši odmah"
                      : "Pošalji zahtev za rezervaciju"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="modal-actions">
              <button
                className="btn-modal-secondary"
                onClick={() =>
                  setConfirmModal({ ...confirmModal, show: false })
                }
              >
                Odustani
              </button>
              <button
                className="btn-modal-primary"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, show: false });
                }}
              >
                Potvrdi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideDetails;
