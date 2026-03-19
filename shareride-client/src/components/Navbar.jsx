import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname === "/auth";
  const isCreateRide = location.pathname === "/create-ride";

  // navbar - desni deo koji zavisi od toga na kojoj smo stranici

  let renderRightSide;

  // 1. slucaj - ako smo na pocetnoj stranici, treba da se prikazuju dugmici "Registruj se" i "Prijavi se" koji vode na /auth
  if (isLandingPage) {
    renderRightSide = (
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() =>
            navigate("/auth", { state: { initialIsLogin: false } })
          }
        >
          Registruj se
        </button>
        <button
          onClick={() => navigate("/auth", { state: { initialIsLogin: true } })}
        >
          Prijavi se
        </button>
      </div>
    );
  }
  // 2. slucaj - ako smo na /auth stranici, treba da se prikaze samo dugme "Vratite se nazad" koje vodi na "/"
  else if (isAuthPage) {
    renderRightSide = (
      <button onClick={() => navigate("/")}>Vrati se nazad</button>
    );
  }
  // 3. slucaj - korisnik je ulogovan, treba da se prikaze dugme "Ponudite voznju" i slika korisnika
  else {
    renderRightSide = (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          position: "relative",
        }}
      >
        {isCreateRide ? (
          <button onClick={() => navigate("/dashboard")}>Vrati se nazad</button>
        ) : (
          <button onClick={() => navigate("/create-ride")}>
            Ponudi voznju
          </button>
        )}

        <div
          style={{ cursor: "pointer" }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <img
            src={user?.profilePictureUrl || "/default-avatar.svg"}
            alt="Profil"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {isMenuOpen && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: "0",
              background: "white",
              border: "1px solid #ccc",
              padding: "10px",
              zIndex: 100,
            }}
          >
            <button
              onClick={() => {
                logout();
                navigate("/");
                setIsMenuOpen(false);
              }}
            >
              Odjavi se
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #eee",
      }}
    >
      <div style={{ cursor: "pointer" }}>
        <img
          src="/ridesharelogobold.svg"
          alt="ShareRide Logo"
          style={{ height: "40px" }}
        />
      </div>

      {renderRightSide}
    </nav>
  );
};

export default Navbar;
