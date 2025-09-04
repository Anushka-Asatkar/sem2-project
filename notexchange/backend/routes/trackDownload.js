const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://notexchange:studynotes@cluster0.kymwy8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const dbName = "notexchange";

async function trackDownload(req, res, userId, noteId) {
  try {
    await client.connect();
    const db = client.db(dbName);

    const record = {
      userId: new ObjectId(userId),
      noteId: new ObjectId(noteId),
      downloadedAt: new Date()
    };

    await db.collection("downloads").insertOne(record);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Download tracked" }));
  } catch (err) {
    res.writeHead(500);
    res.end("Error tracking download");
  }
}

module.exports = trackDownload;
