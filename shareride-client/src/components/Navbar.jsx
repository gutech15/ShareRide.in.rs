import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useRideStore } from "../store/useRideStore";
import useNotificationStore from "../store/useNotificationStore";
import useChatStore from "../store/useChatStore";
import { useState, useEffect, useRef } from "react";
import { getImageUrl } from "../api/imageHelper";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { unreadCount, stopConnection } = useNotificationStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { clearAllRides } = useRideStore();

  const { unreadCount: notificationCount } = useNotificationStore();
  const { totalChatUnreadCount, loadConversations, startChatConnection } =
    useChatStore();

  const menuRef = useRef(null);

  const isLandingPage = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";
  const isAuthPage = location.pathname === "/auth";

  useEffect(() => {
    if (user) {
      startChatConnection();
      loadConversations();
    }
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, user]);

  const totalAlerts = (notificationCount || 0) + (totalChatUnreadCount || 0);

  const handleLogout = async () => {
    await stopConnection();
    clearAllRides();
    logout();
    navigate("/");
  };

  let renderRightSide;

  if (isLandingPage) {
    renderRightSide = (
      <div className="nav-auth-group">
        <button
          className="nav-btn-secondary"
          onClick={() =>
            navigate("/auth", { state: { initialIsLogin: false } })
          }
        >
          Registruj se
        </button>
        <button
          className="nav-btn-primary"
          onClick={() => navigate("/auth", { state: { initialIsLogin: true } })}
        >
          Prijavi se
        </button>
      </div>
    );
  } else if (isAuthPage) {
    renderRightSide = (
      <button className="nav-btn-secondary" onClick={() => navigate("/")}>
        ← Vrati se nazad
      </button>
    );
  } else {
    renderRightSide = (
      <div className="nav-user-section" ref={menuRef}>
        {!isDashboard ? (
          <button
            className="nav-btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            ← Vrati se na početnu
          </button>
        ) : (
          <button
            className="nav-btn-secondary"
            onClick={() => navigate("/create-ride")}
          >
            Ponudi vožnju
          </button>
        )}

        <div
          className="nav-profile-wrapper"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <img
            src={getImageUrl(user?.profilePictureUrl)}
            alt="Profil"
            className="nav-profile-img"
          />
          {totalAlerts > 0 && (
            <span className="nav-notification-badge">{totalAlerts}</span>
          )}
        </div>

        {isMenuOpen && (
          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              onClick={() => {
                navigate(`/profile/${user?.id}`);
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon icon-profile"></span>
              <span>Profil</span>
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                navigate("/my-rides");
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon icon-rides"></span>
              <span>Moje vožnje</span>
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                navigate("/requests");
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon icon-requests"></span>
              <span>Zahtevi</span>
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                navigate("/chat");
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon icon-chat"></span>
              <span>Poruke</span>

              {totalChatUnreadCount > 0 && (
                <span className="dropdown-unread-count chat-badge">
                  {totalChatUnreadCount}
                </span>
              )}
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                navigate("/notifications");
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon icon-bell"></span>
              <span>Obaveštenja</span>
              {unreadCount > 0 && (
                <span className="dropdown-unread-count">{unreadCount}</span>
              )}
            </button>

            <div className="dropdown-divider"></div>

            <button
              className="dropdown-item logout-item"
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon icon-logout"></span>
              <span>Odjavi se</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="navbar-main">
      <div className="navbar-container">
        <div
          className="navbar-logo-wrapper"
          onClick={() => navigate(user ? "/dashboard" : "/")}
        >
          <img
            src="/logo-nov.svg"
            alt="ShareRide Logo"
            className="navbar-logo"
          />
        </div>
        {renderRightSide}
      </div>
    </nav>
  );
};

export default Navbar;
