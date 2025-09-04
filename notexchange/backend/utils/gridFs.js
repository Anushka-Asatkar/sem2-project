const { MongoClient, GridFSBucket } = require('mongodb');

const uri = "YOUR_MONGODB_ATLAS_CONNECTION_STRING"; // 🔁 Replace this
const client = new MongoClient(uri);
let bucket;

async function connectToGridFS() {
  if (!bucket) {
    await client.connect();
    const db = client.db("notexchange"); // 🔁 Replace with your DB name
    bucket = new GridFSBucket(db, { bucketName: "notesFiles" });
  }
  return bucket;
}

module.exports = connectToGridFS;
