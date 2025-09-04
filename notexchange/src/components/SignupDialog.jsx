import React, { useState } from "react";
import "../styles/Modal.css";

const SignupDialog = ({ onClose, switchToLogin }) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("Signing up...");

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Signup successful! Please log in.");
        setTimeout(onClose, 2000); // Close after success
      } else {
        setMessage(data.error || "Signup failed");
      }
    } catch (err) {
      setMessage("Signup error: " + err.message);
    }
  };

  return (
    <div className="dialog-box">
      <form className="dialog-form" onSubmit={handleSignup}>
        <h2>Sign Up</h2>
        <input type="text" name="name" placeholder="Your Name" required onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        <button type="submit">Create Account</button>
        <p className="dialog-message">{message}</p>
        
        <div className="switch-form">
        <button type="button" onClick={switchToLogin}>
            Already have an account? Login
          </button>
        </div>

        <button type="button" className="dialog-close" onClick={onClose}>×</button>
      </form>
    </div>
  );
};

export default SignupDialog;
