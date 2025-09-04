// src/components/NoteUpload.jsx
import React, { useState } from "react";
import "./NoteUpload.css";

const NoteUpload = ({ userId }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    file: null,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.file) {
      return setMessage("Please enter a title and choose a file.");
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("userId", userId);
    data.append("file", formData.file);

    try {
      const res = await fetch("http://localhost:5000/api/notes/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Note uploaded successfully!");
        setFormData({ title: "", description: "", category: "", file: null });
      } else {
        setMessage(`❌ Upload failed: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload error occurred.");
    }
  };

  return (
    <div className="note-upload-container">
      <h2>📤 Upload a New Note</h2>
      {message && <p className="note-upload-message">{message}</p>}
      <form onSubmit={handleSubmit} className="note-upload-form">
        <input
          type="text"
          name="title"
          placeholder="Note Title *"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category (optional)"
          value={formData.category}
          onChange={handleChange}
        />
        <input type="file" name="file" accept=".pdf" onChange={handleChange} required />
        <button type="submit">Upload Note</button>
      </form>
    </div>
  );
};

export default NoteUpload;
