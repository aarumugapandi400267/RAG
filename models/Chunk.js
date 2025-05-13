import mongoose from "mongoose";

const ChunkSchema = new mongoose.Schema({
  text: String,
  embedding: { type: [Number], required: true },
});

export const Chunk = mongoose.model("Chunk", ChunkSchema);
