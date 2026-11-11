const { AiServiceError, generateResponse } = require("../services/aiService");

async function chat(req, res, next) {
  const content = req.body?.content;
  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Provide non-empty text in the 'content' field." });
  }
  if (content.length > 60000) {
    return res.status(413).json({ error: "Chat content must be 60,000 characters or fewer." });
  }

  try {
    const output = await generateResponse(content);
    return res.json({ output });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    return next(error);
  }
}

module.exports = { chat };
