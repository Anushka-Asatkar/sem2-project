// components/Hero.jsx
import React, { useState } from "react";
import "../styles/Hero.css";
import SignupDialog from "./SignupDialog";
import LoginDialog from "./LoginDialog";
import Features from "./Features";

const Hero = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
    <div className="hero-section">
      <nav className="hero-navbar">
        <div className="logo">📚 <span>NoteXchange</span></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About Us</a>
          <button className="signup-btn" onClick={() => setShowSignup(true)}>Signup</button>
        </div>
      </nav>

      <div className="hero-content">
        <div className="hero-text">
          <h1>Welcome to</h1>
          <h2>NoteXchange 🎓</h2>
          <p>Collaborate, share, and access top-quality student notes – all in one place.</p>
          <button className="start-btn" onClick={() => setShowLogin(true)}>Get Started</button>
        </div>
        <div className="hero-image">
          <img src="./src/digital books.png" alt="Illustration" />
        </div>
      </div>

      {showSignup && <SignupDialog onClose={() => setShowSignup(false)} switchToLogin={() => { setShowSignup(false); setShowLogin(true); }} />}
      {showLogin && <LoginDialog onClose={() => setShowLogin(false)} switchToSignup={() => { setShowLogin(false); setShowSignup(true); }} />}
    </div>
    <Features />

    </>
  );
};

export default Hero;
