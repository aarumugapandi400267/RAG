import express from "express";
import { queryGemini } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/ask", queryGemini);
export default router;
