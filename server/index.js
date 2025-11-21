import express from "express";
import dotenv from "dotenv";
import dbConnect from "./dbConnect.js";
import authRouter from "./routers/authRouter.js";
import postsRouter from "./routers/postsRouter.js";
import userRouter from "./routers/userRouter.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// Security middlewares
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Load environment variables
dotenv.config({ path: "./.env" });

// Cloudinary configuration
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// Basic security hardening
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Enable trust proxy in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// CORS configuration
let origin = process.env.CLIENT_URL || "http://localhost:3000";
if (process.env.NODE_ENV === "production" && process.env.CLIENT_URL) {
  origin = process.env.CLIENT_URL;
}

app.use(
  cors({
    credentials: true,
    origin,
  })
);

// Routes
app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/user", userRouter);

// Health check
app.get("/", (req, res) => {
  res.status(200).send("OK from Server");
});

// 404 handler
app.use((req, res) => {
  return res
    .status(404)
    .send({ status: "error", statusCode: 404, message: "Not found" });
});

// after dbConnect import and app setup
const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await dbConnect();

    // Global error handler
    app.use((err, req, res, next) => {
      console.error(err);
      if (res.headersSent) return next(err);
      res.status(err.status || 500).send({
        status: "error",
        statusCode: err.status || 500,
        message:
          process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : err.message,
      });
    });

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server listening on port: ${PORT}`);
    });

    // graceful shutdown
    process.on("SIGINT", async () => {
      console.log("SIGINT received. Closing server and DB connection...");
      await mongoose.disconnect();
      server.close(() => process.exit(0));
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
