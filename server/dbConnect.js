const mongoose = require("mongoose");

module.exports = async () => {
  const mongoUri = process.env.MONGO_URI;

  try {
    // Add this line to silence the warning
    mongoose.set("strictQuery", false);
    const connect = await mongoose.connect(mongoUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
