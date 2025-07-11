import { genAI } from "../config/gemini.js";
import { Chunk } from "../models/Chunk.js";
import cosineSimilarity from "../utils/cosineSimilarity.js";

export const queryGemini = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    const embedModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await embedModel.embedContent({
      content: {
        parts: [{ text: question.trim() }]
      }
    });

    const questionEmbedding = result.embedding?.values;
    if (!questionEmbedding) {
      return res.status(500).json({ error: "Failed to generate question embedding" });
    }

    const chunks = await Chunk.find();

    const SIMILARITY_THRESHOLD = 0.7;
    const ranked = chunks
      .map((chunk) => ({
        text: chunk.text,
        score: cosineSimilarity(chunk.embedding, questionEmbedding),
      }))
      .filter((item) => item.score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const context = ranked.map((r) => r.text).join("\n");

    const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await chatModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${context}\n\nQ: ${question}` }],
        },
      ],
    });

    // ✅ Debug: Log the response to confirm the structure
    // console.dir(response, { depth: null });

    // Extract the answer from the response
    const answer = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(response)
    if (!answer) {
      return res.status(500).json({ error: "No answer received from Gemini API" });
    }

    res.json({ answer });
  } catch (error) {
    console.error("❌ Error in Gemini Query:", error);
    res.status(500).json({ error: "Gemini AI failed to process the request" });
  }
};
