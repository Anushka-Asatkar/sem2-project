const formidable = require("formidable");
const fs = require("fs");
const connectToGridFS = require("./utils/gridFs");
const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://notexchange:studynotes@cluster0.kymwy8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // 🔁 Replace this
const client = new MongoClient(uri);
const dbName = "notexchange"; // 🔁 Use your DB name

async function handleUpload(req, res) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.writeHead(500);
      res.end("Error parsing the file");
      return;
    }

    try {
      const bucket = await connectToGridFS();
      const { title, description, userId } = fields;
      const filePath = files.file[0].filepath;
      const fileName = files.file[0].originalFilename;

      const uploadStream = bucket.openUploadStream(fileName);
      fs.createReadStream(filePath).pipe(uploadStream)
        .on("error", () => {
          res.writeHead(500);
          res.end("Error uploading file to GridFS");
        })
        .on("finish", async (uploadedFile) => {
          const note = {
            title,
            description,
            filename: fileName,
            fileId: uploadedFile._id,
            uploadedBy: new ObjectId(userId),
            uploadedAt: new Date()
          };

          const db = client.db(dbName);
          await db.collection("notes").insertOne(note);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Note uploaded successfully" }));
        });
    } catch (error) {
      res.writeHead(500);
      res.end("Server error: " + error.message);
    }
  });
}

module.exports = handleUpload;
