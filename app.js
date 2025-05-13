import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import chunkRoutes from "./routes/chunkRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/chunks", chunkRoutes);
app.use("/api/gemini", geminiRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
