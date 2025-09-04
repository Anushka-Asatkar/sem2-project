const { MongoClient, ObjectId } = require("mongodb");
const connectToGridFS = require("./utils/gridFs");

const uri = "mongodb+srv://notexchange:studynotes@cluster0.kymwy8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // 🔁 Replace
const client = new MongoClient(uri);
const dbName = "notexchange";

async function handleDownload(req, res, fileId) {
  try {
    const bucket = await connectToGridFS();
    const id = new ObjectId(fileId);

    const downloadStream = bucket.openDownloadStream(id);
    downloadStream.on("error", () => {
      res.writeHead(404);
      res.end("File not found");
    });

    res.setHeader("Content-Disposition", "attachment; filename=file");
    downloadStream.pipe(res);
  } catch (err) {
    res.writeHead(500);
    res.end("Error downloading file");
  }
}

module.exports = handleDownload;
