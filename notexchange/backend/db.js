// backend/db.js
const mongoose = require('mongoose');
const { MongoClient, GridFSBucket } = require('mongodb');

let gfsBucket;

const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const db = client.db(); // Default DB from URI
    gfsBucket = new GridFSBucket(db, {
      bucketName: 'uploads',
    });

    console.log('✅ MongoDB connected and GridFS bucket ready');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

const getGridFSBucket = () => gfsBucket;

module.exports = { connectToDB, getGridFSBucket };
