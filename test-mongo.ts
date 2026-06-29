import mongoose from "mongoose";
import "dotenv/config";

async function testConnection() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI!);

    console.log("✅ MongoDB Connected Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection Error:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();