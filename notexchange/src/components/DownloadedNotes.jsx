// src/components/DownloadedNotes.jsx
import React from "react";
import "./DownloadedNotes.css";

const DownloadedNotes = ({ downloads }) => {
  return (
    <div className="notes-section">
      <h3>Downloaded Notes</h3>
      {downloads.length === 0 ? (
        <p>You haven't downloaded any notes yet.</p>
      ) : (
        <ul className="note-list">
          {downloads.map((note, index) => (
            <li key={index}>
              <strong>{note.title}</strong>
              <p>{note.description}</p>
              <small>Downloaded on {new Date(note.downloadedAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DownloadedNotes;
