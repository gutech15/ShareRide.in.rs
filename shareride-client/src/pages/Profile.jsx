import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useRideStore } from "../store/useRideStore";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../api/imageHelper";
import "./Profile.css";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token, updateUser } = useAuthStore();
  const { updateDriverInResults } = useRideStore();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleColor: "",
    vehicleLicensePlate: "",
    deleteVehicle: false,
  });

  const [initialData, setInitialData] = useState({});

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = currentUser?.id === id;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/Users/${id}/profile`);
      const data = response.data;
      setProfile(data);

      const profileFields = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        vehicleMake: data.vehicleMake || "",
        vehicleModel: data.vehicleModel || "",
        vehicleColor: data.vehicleColor || "",
        vehicleLicensePlate: data.vehicleLicensePlate || "",
        deleteVehicle: false,
      };
      console.log(data);
      console.log(profileFields);

      setFormData(profileFields);
      setInitialData(profileFields);
    } catch (error) {
      console.error("Greška pri učitavanju:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id, fetchProfile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("UserId", id);
    data.append("FirstName", formData.firstName || "");
    data.append("LastName", formData.lastName || "");
    data.append("Bio", formData.bio || "");
    data.append("VehicleMake", formData.vehicleMake || "");
    data.append("VehicleModel", formData.vehicleModel || "");
    data.append("VehicleColor", formData.vehicleColor || "");
    data.append("VehicleLicensePlate", formData.vehicleLicensePlate || "");
    data.append("DeleteVehicle", formData.deleteVehicle);

    if (selectedFile) {
      data.append("ProfilePicture", selectedFile);
    }

    try {
      const response = await axiosInstance.put(`/Users/${id}/profile`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedProfile = response.data;

      updateUser({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        profilePictureUrl: updatedProfile.profilePictureUrl,
      });

      setProfile(updatedProfile);

      updateDriverInResults(id, {
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        profilePictureUrl: updatedProfile.profilePictureUrl,
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      setActiveTab("profile");
      const updatedFields = {
        firstName: updatedProfile.firstName || "",
        lastName: updatedProfile.lastName || "",
        bio: updatedProfile.bio || "",
        vehicleMake: updatedProfile.vehicleMake || "",
        vehicleModel: updatedProfile.vehicleModel || "",
        vehicleColor: updatedProfile.vehicleColor || "",
        vehicleLicensePlate: updatedProfile.vehicleLicensePlate || "",
        deleteVehicle: false,
      };

      setFormData(updatedFields);
      setInitialData(updatedFields);
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Greška pri čuvanju:", error);
      alert(error.response?.data?.message || "Došlo je do greške pri čuvanju.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChanged = () => {
    const hasTextChanged = Object.keys(formData).some(
      (key) => formData[key] !== initialData[key],
    );

    const hasImageChanged = selectedFile !== null;

    return hasTextChanged || hasImageChanged;
  };

  if (loading && !profile)
    return <div className="p-50 text-center">Učitavanje...</div>;
  if (!profile)
    return <div className="p-50 text-center">Korisnik nije pronađen.</div>;

  return (
    <div className="profile-page container">
      <div className="profile-tabs">
        <div
          className={`tab-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profil
        </div>
        {isOwner && (
          <div
            className={`tab-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Podešavanja
          </div>
        )}
      </div>

      <div className="profile-content card-box">
        {activeTab === "profile" ? (
          <div className="profile-view">
            <div className="profile-header-row">
              <img
                src={getImageUrl(profile.profilePictureUrl)}
                alt="Profil"
                className="profile-main-avatar"
              />
              <div className="profile-name-section">
                <h2>
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="profile-age">{profile.age} godina</p>
              </div>
            </div>

            <div className="profile-info-row">
              <span className="info-label">Nivo iskustva:</span>
              <span
                className={`experience-badge ${profile.experienceLevel?.toLowerCase()}`}
              >
                {profile.experienceLevel}
              </span>
            </div>

            <div
              className="profile-info-row clickable-row"
              onClick={() => navigate(`/profile/${id}/ratings`)}
            >
              <span className="star-icon">{"★"}</span>
              <span className="rating-text">
                {profile.averageRating} / 5.0 — ({profile.ratingsCount} ocena)
              </span>
              <span className="arrow-right">›</span>
            </div>

            <div className="profile-info-row">
              <img src="/rides-icon.svg" alt="car" className="car-icon" />
              <span>{profile.vehicleInfo || "Nema podataka o autu"}</span>
            </div>

            <hr className="profile-separator" />
            <div className="profile-bio-section">
              <h4 className="section-title">O vozaču</h4>
              <p className="bio-text">
                {profile.bio || "Korisnik još uvek nije uneo biografiju."}
              </p>
            </div>
          </div>
        ) : (
          <div className="settings-view">
            <form className="settings-form" onSubmit={handleSave}>
              <div className="settings-section full-width">
                <h4>Profilna slika</h4>
                <div className="image-upload-container">
                  <img
                    src={previewUrl || getImageUrl(profile.profilePictureUrl)}
                    alt="Preview"
                    className="profile-preview-img"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="settings-details-grid">
                <div className="settings-section">
                  <h4>Lični podaci</h4>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Ime"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Prezime"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                  <textarea
                    placeholder="Biografija"
                    value={formData.bio}
                    rows="4"
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>

                <div className="settings-section">
                  <h4>Vozilo</h4>

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Marka"
                      value={formData.vehicleMake}
                      disabled={formData.deleteVehicle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleMake: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Model"
                      value={formData.vehicleModel}
                      disabled={formData.deleteVehicle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleModel: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Boja"
                      value={formData.vehicleColor}
                      disabled={formData.deleteVehicle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleColor: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Registracija"
                      value={formData.vehicleLicensePlate}
                      disabled={formData.deleteVehicle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleLicensePlate: e.target.value,
                        })
                      }
                    />
                  </div>
                  {(initialData.vehicleMake ||
                    initialData.vehicleModel ||
                    initialData.vehicleLicensePlate ||
                    initialData.vehicleColor) && (
                    <div className="remove-car-row">
                      <input
                        type="checkbox"
                        id="deleteVehicleCheck"
                        checked={formData.deleteVehicle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deleteVehicle: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor="deleteVehicleCheck"
                        style={{ margin: 0, cursor: "pointer", color: "#666" }}
                      >
                        Obriši trenutno vozilo
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="settings-actions">
                <button
                  type="submit"
                  className="save-btn"
                  disabled={!isChanged() || isSubmitting}
                  style={{
                    opacity: !isChanged() || isSubmitting ? 0.6 : 1,
                    cursor:
                      !isChanged() || isSubmitting ? "not-allowed" : "pointer",
                    backgroundColor:
                      !isChanged() || isSubmitting ? "#ccc" : "#489FB5",
                  }}
                >
                  {isSubmitting ? "Čuvanje..." : "Sačuvaj izmene"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      {showToast && (
        <div className="toast-notification">Izmene uspešno sačuvane</div>
      )}
    </div>
  );
};

export default Profile;
