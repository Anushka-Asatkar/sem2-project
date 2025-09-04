// backend/models/DownloadedNote.js
const mongoose = require('mongoose');

const downloadedNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
  downloadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DownloadedNote', downloadedNoteSchema);
