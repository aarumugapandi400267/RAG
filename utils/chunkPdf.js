import fs from "fs";
import pdf from "pdf-parse";

export async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text; // Returns the full text content of the PDF
}

export const extractChunksFromPDF = async (filePath, chunkSize = 300) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const fullText = data.text;

  // 1. Split by resume/profile boundary (customize the regex as needed)
  const resumeRegex = /(Resume|Curriculum Vitae|CV|Name:)/gi;
  const resumes = fullText
    .split(resumeRegex)
    .map((chunk, idx, arr) => {
      // Attach the delimiter for context
      if (resumeRegex.test(chunk) && arr[idx + 1]) {
        return chunk + arr[idx + 1];
      }
      return chunk;
    })
    .filter((chunk) => chunk.trim().length > 100);

  // 2. Chunk each resume by paragraph or section, add metadata
  const allChunks = [];
  const sectionRegex = /(Education|Experience|Skills|Projects|Summary|Contact|Profile|Achievements|Certifications|Interests|Languages|References)[:\n]/gi;

  resumes.forEach((resume, resumeIndex) => {
    // Split by section headers
    const sections = resume.split(sectionRegex).map(s => s.trim()).filter(Boolean);

    let currentSection = "General";
    for (let i = 0; i < sections.length; i++) {
      // If this section matches a header, update currentSection
      if (sectionRegex.test(sections[i])) {
        currentSection = sections[i];
        continue;
      }
      // Otherwise, chunk this section by paragraph and word count
      const paragraphs = sections[i].split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      let buffer = "";
      for (const para of paragraphs) {
        if ((buffer + " " + para).split(" ").length > chunkSize) {
          allChunks.push({
            text: buffer.trim(),
            resumeIndex,
            section: currentSection
          });
          buffer = para;
        } else {
          buffer += " " + para;
        }
      }
      if (buffer.trim()) {
        allChunks.push({
          text: buffer.trim(),
          resumeIndex,
          section: currentSection
        });
      }
    }
  });

  return allChunks;
};
