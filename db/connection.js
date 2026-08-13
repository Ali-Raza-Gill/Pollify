import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI = process.env.MONGODB_URI;

const ConnectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in environment variables");
    }
    
    mongoose.connection.on("connected", () => {
      console.log("✅ Database connection established Successfully");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("❌ Database connection Disconnected Successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.log("⚠️ There was an error connecting to Mongoose:", err.message);
    });

    await mongoose.connect(MONGO_URI);
    
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("Database connection closed Successfully");
      process.exit(0);
    });
  } catch (err) {
    console.log("Failed to connect with mongodb!", err.message);
    process.exit(1);
  }
};

export default ConnectDB;