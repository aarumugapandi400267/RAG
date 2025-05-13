import { extractChunksFromPDF } from "../utils/chunkPdf.js";
import { genAI } from "../config/gemini.js";
import { Chunk } from "../models/Chunk.js";
import fs from "fs";

export const uploadPDF = async (req, res) => {
    try {
        const filePath = req.file.path;
        const chunks = await extractChunksFromPDF(filePath);
        const model = genAI.getGenerativeModel({ model: "embedding-001" });

        for (const text of chunks) {
            const cleanText = text.replace(/\s+/g, " ").trim();

            const result = await model.embedContent({
                content: {
                    parts: [{ text: cleanText }]
                }
            });

            const embedding = result.embedding?.values;

            if (embedding) {
                await Chunk.create({ text: cleanText, embedding });
            }
        }

        fs.unlinkSync(filePath); // delete uploaded file
        res.json({ message: "PDF processed and chunks stored." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process PDF" });
    }
};
