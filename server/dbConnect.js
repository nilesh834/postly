import mongoose from "mongoose";

const dbConnect = async () => {
  mongoose.set("strictQuery", false);

  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};

export default dbConnect;
