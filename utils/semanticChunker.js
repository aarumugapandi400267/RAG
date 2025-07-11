// This is a naive implementation. Replace with LLM-based or advanced logic as needed.
export async function semanticChunkText(resumeText) {
    // Split by pages (assuming each resume starts on a new page)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert resume parser. Parse the following resume text and return a JSON object with the following structure:
{
  "Name": "...",
  "Email": "...",
  "Phone": "...",
  "Summary": "...",
  "Education": "...",
  "Experience": "...",
  "Skills": "...",
  "Projects": "...",
  "Certifications": "..."
}

Make sure all data is accurate. Don't invent data. If a section is missing, leave it as an empty string.
Resume Text:
-----
${resumeText}
-----
`;

    const response = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ]
    });

    const rawText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    try {
        const parsed = JSON.parse(rawText);
        return parsed;
    } catch (e) {
        console.error("Failed to parse JSON from LLM", rawText);
        return null;
    }

}