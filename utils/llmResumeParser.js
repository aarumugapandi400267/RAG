import { genAI } from "../config/gemini.js";

export async function extractResumeSectionsWithLLM(resumeText) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a resume parser. Extract the following sections from this resume and return a clean JSON object:

{
  "Name": "",
  "Email": "",
  "Phone": "",
  "Summary": "",
  "Education": "",
  "Experience": "",
  "Skills": "",
  "Projects": "",
  "Certifications": ""
}

Don't hallucinate. If a field is missing, return an empty string.
Resume:
-----
${resumeText}
-----
`;

    try {
        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const raw = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

        const cleaned = raw.trim().replace(/^```json|```$/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse resume with LLM:", e);
        return null;
    }
}
