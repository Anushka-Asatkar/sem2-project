import React, { useState } from "react";
import "../styles/Modal.css";
import { useNavigate } from "react-router-dom";

const LoginDialog = ({ onClose, switchToSignup }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user._id);
        setMessage("Login successful!");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      setMessage("Login error: " + err.message);
    }
  };

  return (
    <div className="dialog-box">
      <form className="dialog-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        <button type="submit">Login</button>
        <p className="dialog-message">{message}</p>
        <p className="switch-link">
          Don't have an account?{" "}
          <span onClick={switchToSignup} className="switch-btn">Sign up</span>
        </p>
        <button type="button" className="dialog-close" onClick={onClose}>×</button>
      </form>
    </div>
  );
};

export default LoginDialog;
