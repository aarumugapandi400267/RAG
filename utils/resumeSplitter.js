export function extractResumesFromText(text) {
    return text.split(/\f|\n\s*\n\s*\n/).map(r => r.trim()).filter(Boolean);
}
