const OpenAI = require("openai");

class AiServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "AiServiceError";
    this.status = status;
  }
}

async function generateOllamaResponse(content) {
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
      throw new AiServiceError(
        502,
        `Ollama could not answer. Check that the '${model}' model is installed and Ollama is running.`,
      );
    }

    const result = await response.json();
    const output = result.message?.content;
    if (typeof output !== "string" || !output.trim()) {
      throw new AiServiceError(502, "Ollama returned an empty response.");
    }
    return output;
  } catch (error) {
    if (error instanceof AiServiceError) {
      throw error;
    }
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw new AiServiceError(504, "Ollama took too long to respond. Try again.");
    }
    if (error instanceof TypeError) {
      throw new AiServiceError(
        503,
        "Could not reach Ollama. Make sure the Ollama app is running on this computer.",
      );
    }
    throw error;
  }
}

async function generateOpenAiResponse(content) {
  if (!process.env.OPENAI_API_KEY) {
    throw new AiServiceError(503, "Chat is unavailable until OPENAI_API_KEY is configured.");
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content }],
    });
    const output = completion.choices[0]?.message?.content;
    if (!output) {
      throw new AiServiceError(502, "The AI service returned no response.");
    }
    return output;
  } catch (error) {
    if (error instanceof AiServiceError) {
      throw error;
    }
    if (error?.code === "invalid_api_key" || error?.status === 401) {
      throw new AiServiceError(
        503,
        "The AI provider rejected the configured API key. Update OPENAI_API_KEY in backend/.env and restart the server.",
      );
    }
    if (error?.code === "credit_balance_exhausted"
      || error?.code === "insufficient_quota"
      || error?.status === 429) {
      throw new AiServiceError(
        503,
        "The AI provider account has no available API credits. Add API billing or credits, then try again.",
      );
    }
    throw error;
  }
}

async function generateResponse(content) {
  const provider = (process.env.AI_PROVIDER || "openai").trim().toLowerCase();
  if (provider === "ollama") {
    return generateOllamaResponse(content);
  }
  if (provider !== "openai") {
    throw new AiServiceError(500, "AI_PROVIDER must be set to 'openai' or 'ollama'.");
  }
  return generateOpenAiResponse(content);
}

module.exports = { AiServiceError, generateResponse };
