import React, { useEffect, useState } from "react";
// import "./UploadNotes.css"; // Reuses the same styles as UploadedNotes

const SharedNotes = ({ userId }) => {
  const [sharedNotes, setSharedNotes] = useState([]);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/notes/shared/${userId}`)
        .then((res) => res.json())
        .then((data) => setSharedNotes(data))
        .catch((err) => console.error("Error fetching shared notes:", err));
    }
  }, [userId]);

  const handleDownload = (fileId) => {
    window.open(`http://localhost:5000/api/notes/download/${fileId}`, "_blank");
  };

  return (
    <div className="notes-section">
      <h3>Notes You've Downloaded</h3>
      {sharedNotes.length === 0 ? (
        <p>No downloaded/shared notes yet.</p>
      ) : (
        <ul className="note-list">
          {sharedNotes.map((note) => (
            <li key={note._id}>
              <strong>{note.title}</strong>
              <p>{note.description}</p>
              <small>Shared by: {note.uploadedByName || "Unknown"}</small>
              <br />
              <button onClick={() => handleDownload(note.fileId)}>Download Again</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SharedNotes;
