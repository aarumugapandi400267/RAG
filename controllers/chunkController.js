import { extractTextFromPDF } from "../utils/chunkPdf.js";
import { extractResumesFromText } from "../utils/resumeSplitter.js"; // ✅ Correct utility to split
import { extractResumeSectionsWithLLM } from "../utils/llmResumeParser.js"; // ✅ LLM JSON parser
import { genAI } from "../config/gemini.js";
import { Chunk } from "../models/Chunk.js";
import fs from "fs";

export const uploadPDF = async (req, res) => {
    try {
        const filePath = req.file.path;

        // 1. Extract text from uploaded PDF
        const fullText = await extractTextFromPDF(filePath);
        // console.log(fullText)

        // 2. Split into multiple resumes (based on page breaks or spacing)
        const resumes = fullText // 👈 Important fix

        // 3. Initialize Gemini models
        const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
        const summarizer = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let globalResumeIndex = 0;

        for (const resumeText of resumes) {
            // 4. Use LLM to extract resume sections
            const parsedSections = await extractResumeSectionsWithLLM(resumeText);
            if (!parsedSections) continue;

            for (const [section, content] of Object.entries(parsedSections)) {
                const cleanText = content?.replace(/\s+/g, " ").trim();
                if (!cleanText || cleanText.length < 10) continue;

                let summary = cleanText;

                // 5. Summarize only if long
                if (cleanText.split(" ").length > 100) {
                    try {
                        const summaryResponse = await summarizer.generateContent({
                            contents: [
                                {
                                    role: "user",
                                    parts: [{
                                        text: `Summarize the following text in 2-3 sentences. Keep original information intact and do not fabricate:\n${cleanText}`
                                    }]
                                }
                            ]
                        });

                        summary = summaryResponse?.response?.candidates?.[0]?.content?.parts?.[0]?.text || cleanText;
                    } catch (summaryError) {
                        console.warn(`❗ Summary failed for section "${section}". Using raw text.`);
                    }
                }

                // 6. Generate embedding
                try {
                    const result = await embeddingModel.embedContent({
                        content: {
                            parts: [{ text: summary }]
                        }
                    });

                    const embedding = result.embedding?.values;

                    if (embedding) {
                        await Chunk.create({
                            text: summary,
                            embedding,
                            section,
                            resumeIndex: globalResumeIndex
                        });
                    }
                } catch (embedError) {
                    console.error(`❗ Embedding failed for section "${section}":`, embedError);
                }
            }

            globalResumeIndex++;
        }

        // 7. Clean up uploaded file
        fs.unlinkSync(filePath);

        res.json({ message: "✅ PDF processed using LLM resume parsing, summarization, and embeddings stored." });

    } catch (error) {
        console.error("🔥 Error in uploadPDF:", error);
        res.status(500).json({ error: "❌ Failed to process PDF" });
    }
};
