const http = require("http");
const { MongoClient, ObjectId, GridFSBucket } = require("mongodb");
const busboy = require("busboy");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const DB_URI = "mongodb+srv://notexchange:studynotes@cluster0.kymwy8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const PORT = 5000;

let db, gfs, notesCollection, usersCollection;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    ...corsHeaders,
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(200, corsHeaders);
    return res.end();
  }

  // User Signup
  if (req.method === "POST" && req.url === "/api/signup") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { name, email, password } = JSON.parse(body);
        if (!name || !email || !password) {
          return sendJSON(res, 400, { error: "All fields are required" });
        }

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return sendJSON(res, 400, { error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await usersCollection.insertOne({
          name,
          email,
          password: hashedPassword,
          createdAt: new Date(),
        });

        sendJSON(res, 200, { message: "Signup successful", userId: result.insertedId });
      } catch (err) {
        console.error("❌ Signup Error:", err);
        sendJSON(res, 500, { error: "Server error" });
      }
    });
    return;
  }

  // User Login
  if (req.method === "POST" && req.url === "/api/login") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { email, password } = JSON.parse(body);
        if (!email || !password) {
          return sendJSON(res, 400, { error: "Email and password required" });
        }

        const user = await usersCollection.findOne({ email });
        if (!user) {
          return sendJSON(res, 401, { error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return sendJSON(res, 401, { error: "Incorrect password" });
        }

        const { password: _, ...userData } = user;
        sendJSON(res, 200, { message: "Login successful", user: userData });
      } catch (err) {
        console.error("❌ Login Error:", err);
        sendJSON(res, 500, { error: "Server error" });
      }
    });
    return;
  }

  // Get Uploaded Notes by User
  if (req.method === "GET" && req.url.startsWith("/api/notes/uploaded/")) {
    const userId = req.url.split("/").pop();
    if (!userId || userId.length !== 24) {
      return sendJSON(res, 400, { error: "Invalid user ID" });
    }

    const notes = await notesCollection
      .find({ uploadedBy: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return sendJSON(res, 200, notes);
  }

// ✅ NEW: Get All Notes from all users
// ✅ Get All Notes with uploader names
if (req.method === "GET" && req.url === "/api/notes/all") {
  try {
    const notes = await notesCollection
      .aggregate([
        {
          $lookup: {
            from: "users", // your users collection name
            localField: "uploadedBy",
            foreignField: "_id",
            as: "uploaderInfo"
          }
        },
        {
          $unwind: {
            path: "$uploaderInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            title: 1,
            description: 1,
            fileUrl: 1,
            createdAt: 1,
            uploaderName: "$uploaderInfo.name"
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    return sendJSON(res, 200, notes);
  } catch (err) {
    console.error("❌ Failed to fetch all notes:", err);
    return sendJSON(res, 500, { error: "Failed to fetch notes" });
  }
}



  // Download Note File
  if (req.method === "GET" && req.url.startsWith("/api/notes/download/")) {
    const fileId = req.url.split("/").pop();
    if (!fileId || fileId.length !== 24) {
      return sendJSON(res, 400, { error: "Invalid file ID" });
    }

    try {
      const _id = new ObjectId(fileId);
      const files = await gfs.find({ _id }).toArray();

      if (!files || files.length === 0) {
        return sendJSON(res, 404, { error: "File not found" });
      }

      const file = files[0];
      res.writeHead(200, {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        ...corsHeaders,
      });

      const downloadStream = gfs.openDownloadStream(_id);
      downloadStream.pipe(res);
    } catch (err) {
      console.error("❌ Error downloading file:", err);
      sendJSON(res, 500, { error: "Failed to download file" });
    }

    return;
  }


  
  // Upload Note File
  if (req.method === "POST" && req.url === "/api/notes/upload") {
    const bb = busboy({ headers: req.headers });
    let metadata = {};
    let fileId;
    let uploadError = false;

    bb.on("field", (fieldname, val) => {
      metadata[fieldname] = val;
    });

    bb.on("file", (fieldname, file, filename) => {
      console.log("✅ File received:", { filename });

      if (!metadata.userId || metadata.userId.length !== 24) {
        uploadError = true;
        file.resume();
        return;
      }

      try {
        const uploadStream = gfs.openUploadStream(filename, {
          metadata: {
            uploadedBy: new ObjectId(metadata.userId),
            title: metadata.title,
            description: metadata.description,
            category: metadata.category || "",
            createdAt: new Date(),
          },
        });
        fileId = uploadStream.id;
        file.pipe(uploadStream);
      } catch (err) {
        uploadError = true;
        file.resume();
        console.error("❌ Upload error:", err);
      }
    });

    bb.on("finish", async () => {
      if (uploadError) return;

      if (!fileId || !metadata.userId || metadata.userId.length !== 24 || !metadata.title) {
        return sendJSON(res, 400, { error: "Invalid upload data" });
      }

      try {
        await notesCollection.insertOne({
          fileId,
          uploadedBy: new ObjectId(metadata.userId),
          title: metadata.title,
          description: metadata.description,
          category: metadata.category || "",
          createdAt: new Date(),
        });

        sendJSON(res, 200, { message: "Note uploaded to GridFS successfully" });
      } catch (err) {
        console.error("❌ Metadata save error:", err);
        sendJSON(res, 500, { error: "Error saving note metadata" });
      }
    });

    req.pipe(bb);
    return;
  }

// ✅ Download Note File
// if (req.method === "GET" && req.url.startsWith("/api/notes/download/")) {
//   const filename = decodeURIComponent(req.url.split("/api/notes/download/")[1]);
//   const filePath = path.join(__dirname, "uploads", filename); // Assuming 'uploads' folder

//   try {
//     if (fs.existsSync(filePath)) {
//       res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//       res.setHeader("Content-Type", "application/octet-stream");
//       fs.createReadStream(filePath).pipe(res);
//     } else {
//       return sendJSON(res, 404, { error: "File not found" });
//     }
//   } catch (err) {
//     console.error("❌ Download error:", err);
//     return sendJSON(res, 500, { error: "Failed to download file" });
//   }
// }



  // Get All Notes
if (req.method === "GET" && req.url === "/api/notes/all") {
  try {
    const notes = await notesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
      

    return sendJSON(res, 200, notes);
  } catch (err) {
    console.error("❌ Failed to fetch all notes:", err);
    return sendJSON(res, 500, { error: "Failed to fetch notes" });
  }
}

  // Default route
  res.writeHead(404, corsHeaders);
  res.end("Not Found");
});

MongoClient.connect(DB_URI)
  .then((client) => {
    db = client.db();
    gfs = new GridFSBucket(db);
    notesCollection = db.collection("notes");
    usersCollection = db.collection("users");
    console.log("✅ Connected to MongoDB & GridFS");

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });
