// server/routes/notes.js

const { MongoClient, ObjectId, GridFSBucket } = require("mongodb");
const fs = require("fs");
const path = require("path");
const mongoUri = "mongodb+srv://notexchange:studynotes@cluster0.kymwy8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(mongoUri);

async function handleNotes(req, res) {
  try {
    await client.connect();
    const db = client.db("notexchange");
    const notesCollection = db.collection("notes");
    const gfs = new GridFSBucket(db, { bucketName: "uploads" });

    const url = new URL(req.url, `http://${req.headers.host}`);

    // Handle POST request for saving notes
    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", async () => {
        const { userEmail, content } = JSON.parse(body);
        await notesCollection.insertOne({ userEmail, content, createdAt: new Date() });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "Note saved" }));
      });

    // Handle GET request for fetching notes by email
    } else if (req.method === "GET") {
      const userEmail = url.searchParams.get("email");
      const notes = await notesCollection.find({ userEmail }).toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(notes));

    // Handle GET request for downloading or previewing the note's file
    } else if (req.method === "GET" && url.pathname.startsWith("/api/notes/file/")) {
      const fileId = url.pathname.split("/").pop(); // Extract fileId from the URL

      const file = await gfs.find({ _id: new ObjectId(fileId) }).toArray();

      if (!file || file.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "File not found" }));
        return;
      }

      const fileData = file[0];
      const filePath = path.join(__dirname, 'uploads', fileData.filename); // Assuming files are stored in the uploads directory
      
      // To download
      if (req.url.includes("/download")) {
        res.writeHead(200, {
          "Content-Type": "application/pdf", // Adjust this based on file type (PDF, DOCX, etc.)
          "Content-Disposition": `attachment; filename=${fileData.filename}`,
        });
        fs.createReadStream(filePath).pipe(res);
      } 
      
      // To preview
      else if (req.url.includes("/preview")) {
        res.writeHead(200, { "Content-Type": "application/pdf" }); // Adjust MIME type as needed
        fs.createReadStream(filePath).pipe(res);
      }

    // Handle DELETE request for deleting a note by its ID
    } else if (req.method === "DELETE") {
      const noteId = url.pathname.split("/").pop(); // Get ID from /api/notes/delete/:id
      const note = await notesCollection.findOne({ _id: new ObjectId(noteId) });

      if (!note) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Note not found" }));
        return;
      }

      // Delete the file from GridFS
      if (note.fileId) {
        await gfs.delete(new ObjectId(note.fileId));
      }

      // Delete the note record from the notes collection
      await notesCollection.deleteOne({ _id: new ObjectId(noteId) });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Note deleted successfully" }));

    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }

  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server error" }));
  } finally {
    await client.close();
  }
}

module.exports = handleNotes;
