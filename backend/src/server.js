const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const fileUpload = require("express-fileupload");
const OpenAI = require("openai");
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://127.0.0.1:5500,http://localhost:5500")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    try {
      const { hostname, protocol } = new URL(origin);
      const isLocalDevelopmentOrigin = protocol === "http:"
        && ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
      return callback(null, isLocalDevelopmentOrigin);
    } catch {
      return callback(null, false);
    }
  },
}));
app.use(express.json({ limit: "128kb" }));
app.use(fileUpload({
  abortOnLimit: true,
  limits: { fileSize: 10 * 1024 * 1024 },
}));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/pdf/extract", async (req, res, next) => {
  const file = req.files?.pdfFile;
  if (!file || Array.isArray(file)) {
    return res.status(400).json({ error: "Upload one PDF in the 'pdfFile' field." });
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return res.status(415).json({ error: "Only PDF files are supported." });
  }

  try {
    const parsed = await pdfParse(file.data);
    return res.json({ text: parsed.text });
  } catch (error) {
    console.error("PDF parsing failed:", error);
    return res.status(422).json({ error: "The uploaded file could not be parsed as a PDF." });
  }
});

app.post("/api/chat", async (req, res, next) => {
  const content = req.body?.content;
  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Provide non-empty text in the 'content' field." });
  }
  if (content.length > 60000) {
    return res.status(413).json({ error: "Chat content must be 60,000 characters or fewer." });
  }
  const provider = (process.env.AI_PROVIDER || "openai").trim().toLowerCase();
  if (provider === "ollama") {
    const baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
    const model = process.env.OLLAMA_MODEL || "llama3.2:latest";

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content }],
          stream: false,
        }),
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        const details = await response.text();
        console.error("Ollama request failed:", response.status, details.slice(0, 500));
        return res.status(502).json({
          error: `Ollama could not answer. Check that the '${model}' model is installed and Ollama is running.`,
        });
      }

      const result = await response.json();
      const output = result.message?.content;
      if (typeof output !== "string" || !output.trim()) {
        return res.status(502).json({ error: "Ollama returned an empty response." });
      }
      return res.json({ output });
    } catch (error) {
      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        return res.status(504).json({ error: "Ollama took too long to respond. Try again." });
      }
      if (error instanceof TypeError) {
        return res.status(503).json({
          error: "Could not reach Ollama. Make sure the Ollama app is running on this computer.",
        });
      }
      return next(error);
    }
  }

  if (provider !== "openai") {
    return res.status(500).json({ error: "AI_PROVIDER must be set to 'openai' or 'ollama'." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "Chat is unavailable until OPENAI_API_KEY is configured." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content }],
    });
    const output = completion.choices[0]?.message?.content;
    if (!output) {
      return res.status(502).json({ error: "The AI service returned no response." });
    }
    return res.json({ output });
  } catch (error) {
    if (error?.code === "invalid_api_key" || error?.status === 401) {
      return res.status(503).json({
        error: "The AI provider rejected the configured API key. Update OPENAI_API_KEY in backend/.env and restart the server.",
      });
    }
    if (error?.code === "credit_balance_exhausted" || error?.code === "insufficient_quota" || error?.status === 429) {
      return res.status(503).json({
        error: "The AI provider account has no available API credits. Add API billing or credits, then try again.",
      });
    }
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("API request failed:", error?.status || "unknown status", error?.code || error?.type || error?.name || "Error");
  if (error.status === 413 || error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Uploaded files must be 10 MB or smaller." });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "The request body must contain valid JSON." });
  }
  return res.status(500).json({ error: "The server could not complete the request." });
});

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

if (require.main === module) {
  app.listen(port, () => {
    console.log(`TeacherAI API listening on http://localhost:${port}`);
  });
}

module.exports = app;
