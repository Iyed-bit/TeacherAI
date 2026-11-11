const express = require("express");
const { chat } = require("../controllers/chatController");
const { extractPdf } = require("../controllers/pdfController");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
router.post("/pdf/extract", extractPdf);
router.post("/chat", chat);

module.exports = router;
