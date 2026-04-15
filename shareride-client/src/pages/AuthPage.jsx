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
    dateOfBirth: "",
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
        dateOfBirth: registerData.dateOfBirth,
        password: registerData.password,
      });

      loginUser(response.data);
      console.log(response.data);
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.detail || "Serverska greska";
      setError(message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-main-content">
        <div
          className={`auth-container ${!isLogin ? "right-panel-active" : ""}`}
        >
          <div className="form-container login-side">
            <form onSubmit={handleLoginSubmit}>
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
              {error && <div className="error-message">⚠️ {error}</div>}
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
                  Nemaš nalog? Registruj se
                </p>
              </div>
            </form>
          </div>

          <div className="form-container register-side">
            <form onSubmit={handleRegisterSubmit}>
              <h1 className="form-title">Napravi nalog</h1>

              <div className="form-row">
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
              </div>

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
                name="phoneNumber"
                placeholder="Broj telefona"
                value={registerData.phoneNumber}
                onChange={handleRegisterChange}
                required
              />

              <input
                type="date"
                name="dateOfBirth"
                value={registerData.dateOfBirth}
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
              {error && <div className="error-message">⚠️ {error}</div>}
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
                  Već imaš nalog? Prijavi se
                </p>
              </div>
            </form>
          </div>

          <div
            className={`sliding-overlay ${isLogin ? "move-left" : "move-right"}`}
          >
            <img src="/logo-nov.svg" className="overlay-logo" alt="Logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
