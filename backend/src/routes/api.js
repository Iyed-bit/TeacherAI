const express = require("express");
const { chat } = require("../controllers/chatController");
const { extractPdf } = require("../controllers/pdfController");
const { generateQuiz } = require("../controllers/quizController");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
router.post("/pdf/extract", extractPdf);
router.post("/chat", chat);
router.post("/quiz/generate", generateQuiz);

module.exports = router;
