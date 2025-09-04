import React, { useState, useEffect } from "react";
import "../styles/Modal.css";

const UpdateProfileDialog = ({ onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("Updating...");

    try {
      const res = await fetch("http://localhost:5000/api/update-profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userId: user._id }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.updatedUser));
        onUpdate(data.updatedUser);  // update parent state
        setMessage("Profile updated!");
        setTimeout(onClose, 1000);
      } else {
        setMessage(data.error || "Update failed.");
      }
    } catch (err) {
      setMessage("Update error: " + err.message);
    }
  };

  return (
    <div className="dialog-box">
      <form className="dialog-form" onSubmit={handleUpdate}>
        <h2>Update Profile</h2>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <button type="submit">Save Changes</button>
        <p className="dialog-message">{message}</p>
        <button type="button" className="dialog-close" onClick={onClose}>×</button>
      </form>
    </div>
  );
};

export default UpdateProfileDialog;
