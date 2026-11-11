const pdfParse = require("pdf-parse");

async function extractText(fileBuffer) {
  const parsed = await pdfParse(fileBuffer);
  return parsed.text;
}

module.exports = { extractText };
