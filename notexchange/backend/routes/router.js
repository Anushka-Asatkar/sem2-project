// routes/router.js

const { handleSignup, handleLogin } = require("../controllers/authController");
const { handleUploadNote, handleGetNotes } = require("../controllers/notesController");

function handleRequest(req, res) {
  const { url, method } = req;

  // Allow CORS for frontend to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes for Authentication
  if (url === "/signup" && method === "POST") {
    handleSignup(req, res);
  } else if (url === "/login" && method === "POST") {
    handleLogin(req, res);
  }

  // Routes for Notes
  else if (url === "/uploadnote" && method === "POST") {
    handleUploadNote(req, res);
  } else if (url === "/getnotes" && method === "GET") {
    handleGetNotes(req, res);
  }

  // If route not found
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
}

module.exports = { handleRequest };
