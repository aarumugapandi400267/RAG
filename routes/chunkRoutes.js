import express from "express";
import multer from "multer";
import { uploadPDF } from "../controllers/chunkController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("pdf"), uploadPDF);
export default router;
