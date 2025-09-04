import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import UploadForm from "./NoteUpload";
import UploadedNotes from "./UploadedNotes";
import DownloadedNotes from "./DownloadedNotes";
import SearchFilter from "./SearchFilter";
import AllNotes from "./AllNotes"; // 👈 New import


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [activeSection, setActiveSection] = useState("uploads");
  const [showUploadForm, setShowUploadForm] = useState(false); // NEW

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedInUser) {
      window.location.href = "/";
    } else {
      setUser(loggedInUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleSearch = ({ search, category }) => {
    fetch(`http://localhost:5000/api/notes/uploaded/${user._id}`)
      .then((res) => res.json())
      .then((data) => {
        let filtered = data;
        if (search) {
          filtered = filtered.filter((note) =>
            note.title.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (category) {
          filtered = filtered.filter((note) => note.category === category);
        }
        setFilteredNotes(filtered);
      });
  };

  return (
    <div className="dashboard-container">
      {user && (
        <>
          <header className="dashboard-header">
            <div className="header-left">
              <h1>Welcome, {user.name} 👋</h1>
            </div>
            <div className="header-right">
              <button
                className="upload-toggle-btn"
                onClick={() => setShowUploadForm((prev) => !prev)}
              >
                {showUploadForm ? "Close Upload" : "Upload 📤"}
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <div className="dashboard-content">
            <aside className="sidebar">
            <button
  className={`sidebar-btn ${
    activeSection === "allNotes" ? "active" : ""
  }`}
  onClick={() => setActiveSection("allNotes")}
>
  All Notes 📚
</button>

                

              <button
                className={`sidebar-btn ${
                  activeSection === "uploads" ? "active" : ""
                }`}
                onClick={() => setActiveSection("uploads")}
              >
                My Uploads
              </button>
              <button
                className={`sidebar-btn ${
                  activeSection === "downloads" ? "active" : ""
                }`}
                onClick={() => setActiveSection("downloads")}
              >
                My Downloads
              </button>
            </aside>

            <main className="main-area">
              <SearchFilter onSearch={handleSearch} />

              {showUploadForm && (
                <div className="upload-area">
                  <UploadForm userId={user._id} />
                </div>
              )}

{activeSection === "allNotes" && (
  <div className="all-notes-area">
    <AllNotes />
  </div>
)}

              {activeSection === "uploads" && (
                <div className="uploaded-notes-area">
                  <UploadedNotes
                    userId={user._id}
                    filteredNotes={filteredNotes}
                  />
                </div>
              )}

              {activeSection === "downloads" && (
                <div className="downloaded-notes-area">
                  <DownloadedNotes downloads={downloads} />
                </div>
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
