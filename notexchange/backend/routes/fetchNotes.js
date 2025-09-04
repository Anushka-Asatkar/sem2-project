const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://notexchange:studynotes@cluster0.kymwy8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const dbName = "notexchange";

async function handleFetchNotes(req, res, userId) {
  try {
    await client.connect();
    const db = client.db(dbName);

    const uploadedNotes = await db.collection("notes").find({ uploadedBy: new ObjectId(userId) }).toArray();
    const downloadedNotes = await db.collection("downloads").find({ userId: new ObjectId(userId) }).toArray();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ uploadedNotes, downloadedNotes }));
  } catch (err) {
    res.writeHead(500);
    res.end("Error fetching notes");
  }
}

module.exports = handleFetchNotes;
