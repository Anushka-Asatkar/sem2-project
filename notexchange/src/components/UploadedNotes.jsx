// src/components/UploadedNotes.jsx
import React, { useEffect, useState } from "react";
import "./UploadedNotes.css";

const UploadedNotes = ({ userId }) => {
  const [uploadedNotes, setUploadedNotes] = useState([]);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/notes/uploaded/${userId}`)
        .then((res) => res.json())
        .then((data) => setUploadedNotes(data))
        .catch((err) => console.error("Error fetching uploaded notes:", err));
    }
  }, [userId]);

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notes/download/${fileId}`);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "note.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notes/delete/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");

      // Remove the deleted note from state
      setUploadedNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="notes-section">
      <h3>Your Uploaded Notes</h3>
      {uploadedNotes.length === 0 ? (
        <p>No notes uploaded yet.</p>
      ) : (
        <ul className="note-list">
          {uploadedNotes.map((note) => (
            <li key={note._id}>
              <strong>{note.title}</strong>
              <p>{note.description}</p>
              <div className="note-actions">
                <button onClick={() => handleDownload(note.fileId, note.title)}>Download</button>
                <button onClick={() => handleDelete(note._id)} className="delete-btn">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UploadedNotes;
