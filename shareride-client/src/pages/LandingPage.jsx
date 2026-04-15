import React from "react";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <section className="hero-section">
        <div className="hero-main-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="text-medium">Podeli troškove.</span>
              <span className="text-extra-light">Putuj pametnije.</span>
            </h1>
            <div className="testimonials-wrapper">
              <div className="testimonials-img-container">
                <img
                  src="/testemonials-compressed.png"
                  alt="Korisnici"
                  className="testimonials-avatars"
                />
              </div>
              <div className="testimonials-info">
                <div className="testimonials-text">
                  <span className="font-light">
                    ovi ljudi su ai generisani i nisu
                  </span>
                  <br />
                  <span className="font-light">nas ocenili sa </span>
                  <span className="font-semibold">5 zvezdica</span>
                </div>
                <div className="stars-container">
                  <img
                    src="/stars.svg"
                    alt="5 zvezdica"
                    className="stars-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
