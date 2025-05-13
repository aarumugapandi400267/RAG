import pdf from "pdf-parse";
import fs from "fs";

export const extractChunksFromPDF = async (filePath, chunkSize = 500) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const fullText = data.text;
  const words = fullText.split(" ");
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  return chunks;
};
