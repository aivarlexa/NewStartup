const mongoose = require("mongoose");
const { getMongoUri } = require("./env");

async function startInMemoryMongo() {
  try {
    // Require dynamically so the package is optional
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log("Started in-memory MongoDB for development.", uri);
    return { uri, stop: () => mongod.stop() };
  } catch (err) {
    console.error(
      "To use the in-memory DB set USE_MEMORY_DB=true and install 'mongodb-memory-server'. See README."
    );
    throw err;
  }
}

const connectDB = async () => {
  let mongoUri = getMongoUri();

  if (!mongoUri && String(process.env.USE_MEMORY_DB || "").toLowerCase() === "true") {
    const mem = await startInMemoryMongo().catch((err) => {
      throw new Error("Unable to start in-memory MongoDB: " + err.message);
    });
    mongoUri = mem.uri;
  }

  if (!mongoUri) {
    throw new Error("MONGO_URI is not set. Set MONGO_URI or enable USE_MEMORY_DB=true.");
  }

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
