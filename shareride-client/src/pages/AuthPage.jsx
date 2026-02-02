import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import "./AuthPage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginUser = useAuthStore((state) => state.login);

  const startState = location.state?.initialIsLogin ?? true;
  const [isLogin, setIsLogin] = useState(startState);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleLoginChange = (e) => {
    setError("");
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/auth/login", {
        email: loginData.email,
        password: loginData.password,
      });

      loginUser(response.data);

      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.detail || "Serverska greska";
      setError(message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/auth/register", {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phoneNumber: registerData.phoneNumber,
        password: registerData.password,
      });

      loginUser(response.data);
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.detail || "Serverska greska";
      setError(message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            <img
              src="/ridesharelogobold.svg"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
              alt="Logo"
            />
          </div>
          <div className="nav-actions">
            <button className="btn-text" onClick={() => navigate("/")}>
              ← Vrati se nazad
            </button>
          </div>
        </div>
      </nav>

      <div className="auth-main-content">
        <div
          className={`auth-container ${!isLogin ? "right-panel-active" : ""}`}
        >
          <div className="form-container login-side">
            <form onSubmit={handleLoginSubmit}>
              {" "}
              <h1 className="form-title">Prijavi se</h1>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Lozinka"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🐵" : "🙈"}
                </span>
              </div>
              {error && (
                <div
                  className="error-message"
                  style={{
                    color: "#ff4d4d",
                    fontSize: "0.85rem",
                    marginBottom: "10px",
                    fontWeight: "600",
                    backgroundColor: "#fff0f0",
                    padding: "8px",
                    borderRadius: "5px",
                    width: "100%",
                  }}
                >
                  ⚠️ {error}
                </div>
              )}
              <button type="submit" className="auth-main-btn">
                Prijavi se
              </button>
              <div className="link-center-wrapper">
                <p
                  className="form-link-text"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                >
                  Nemate nalog? Registrujte se
                </p>
              </div>
            </form>
          </div>

          <div className="form-container register-side">
            <form onSubmit={handleRegisterSubmit}>
              <h1 className="form-title">Napravi nalog</h1>

              <input
                type="text"
                name="firstName"
                placeholder="Ime"
                value={registerData.firstName}
                onChange={handleRegisterChange}
                required
              />

              <input
                type="text"
                name="lastName"
                placeholder="Prezime"
                value={registerData.lastName}
                onChange={handleRegisterChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Broj telefona"
                value={registerData.phone}
                onChange={handleRegisterChange}
                required
              />

              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Lozinka"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🐵" : "🙈"}
                </span>
              </div>
              {error && (
                <div
                  className="error-message"
                  style={{
                    color: "#ff4d4d",
                    fontSize: "0.85rem",
                    marginBottom: "10px",
                    fontWeight: "600",
                    backgroundColor: "#fff0f0",
                    padding: "8px",
                    borderRadius: "5px",
                    width: "100%",
                  }}
                >
                  ⚠️ {error}
                </div>
              )}
              <button type="submit" className="auth-main-btn">
                Registruj se
              </button>

              <div className="link-center-wrapper">
                <p
                  className="form-link-text"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                >
                  Već ste registrovani? Prijavite se
                </p>
              </div>
            </form>
          </div>

          <div
            className={`sliding-overlay ${isLogin ? "move-left" : "move-right"}`}
          >
            <img
              src="/ridesharelogobold.svg"
              className="overlay-logo"
              alt="Logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
