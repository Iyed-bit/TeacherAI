const { extractText } = require("../services/pdfService");

async function extractPdf(req, res) {
  const file = req.files?.pdfFile;
  if (!file || Array.isArray(file)) {
    return res.status(400).json({ error: "Upload one PDF in the 'pdfFile' field." });
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return res.status(415).json({ error: "Only PDF files are supported." });
  }

  try {
    const text = await extractText(file.data);
    return res.json({ text });
  } catch (error) {
    console.error("PDF parsing failed:", error);
    return res.status(422).json({ error: "The uploaded file could not be parsed as a PDF." });
  }
}

module.exports = { extractPdf };
