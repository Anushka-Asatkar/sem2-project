// backend/models/Note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: String,
  description: String,
  filename: String,
  fileId: mongoose.Types.ObjectId,
  uploadedBy: mongoose.Schema.Types.ObjectId,
  downloadedBy: [mongoose.Schema.Types.ObjectId],
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Note', noteSchema);
