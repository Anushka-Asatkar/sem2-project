import React, { useEffect, useState } from "react";
import "./AllNotes.css";

const AllNotes = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/notes/all")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error("Failed to fetch all notes:", err));
  }, []);

  const handleDownload = (fileId, fileName) => {
    // Construct the URL to download the file
    const fileUrl = `http://localhost:5000/api/notes/file/${fileId}`;

    // Create a temporary anchor element for downloading
    const anchor = document.createElement("a");
    anchor.href = fileUrl;
    anchor.download = fileName || "download";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handlePreview = (fileId) => {
    // Construct the URL to preview the file
    const fileUrl = `http://localhost:5000/api/notes/file/${fileId}`;
    
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="all-notes-container">
      <h2>All Uploaded Notes</h2>
      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <ul className="all-notes-list">
          {notes.map((note) => (
            <li key={note._id} className="note-card">
              <h3>{note.title}</h3>
              <p>
                <strong>Description:</strong> {note.description}
              </p>
              <p>
                <strong>Uploaded by:</strong> {note.uploaderName || "Unknown"}
              </p>

              <div className="note-actions">
                <button
                  onClick={() => handleDownload(note._id, note.title)}
                  className="download-btn"
                >
                  📥 Download
                </button>

                <button
                  onClick={() => handlePreview(note._id)}
                  className="preview-btn"
                >
                  👁️ Preview
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllNotes;
