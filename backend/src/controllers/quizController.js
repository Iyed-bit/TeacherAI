const { AiServiceError } = require("../services/aiService");
const { createQuiz } = require("../services/quizService");

async function generateQuiz(req, res, next) {
  const { topic, difficulty, questionCount } = req.body || {};
  if (typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({ error: "Enter a topic for your quiz." });
  }
  if (topic.trim().length > 300) {
    return res.status(400).json({ error: "Quiz topics must be 300 characters or fewer." });
  }
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return res.status(400).json({ error: "Choose an easy, medium, or hard difficulty." });
  }
  if (!Number.isInteger(questionCount) || questionCount < 3 || questionCount > 10) {
    return res.status(400).json({ error: "Choose between 3 and 10 questions." });
  }

  try {
    const questions = await createQuiz(topic.trim(), difficulty, questionCount);
    return res.json({ topic: topic.trim(), difficulty, questions });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    return next(error);
  }
}

module.exports = { generateQuiz };
