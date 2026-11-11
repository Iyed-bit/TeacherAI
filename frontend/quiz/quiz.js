const setupScreen = document.getElementById("setup-screen");
const loadingScreen = document.getElementById("loading-screen");
const questionScreen = document.getElementById("question-screen");
const resultsScreen = document.getElementById("results-screen");
const quizForm = document.getElementById("quiz-form");
const setupError = document.getElementById("setup-error");
const generateButton = document.getElementById("generate-button");
const topicInput = document.getElementById("quiz-topic");
const optionsContainer = document.getElementById("answer-options");
const checkButton = document.getElementById("check-answer");
const nextButton = document.getElementById("next-question");
const answerFeedback = document.getElementById("answer-feedback");

let quiz = null;
let questionIndex = 0;
let score = 0;
let selectedAnswer = null;
let answerChecked = false;

function showScreen(screen) {
  setupScreen.hidden = screen !== "setup";
  loadingScreen.hidden = screen !== "loading";
  questionScreen.hidden = screen !== "question";
  resultsScreen.hidden = screen !== "results";
}

function setBusy(isBusy) {
  generateButton.disabled = isBusy;
  generateButton.querySelector(".button-label").textContent = isBusy ? "Making your quiz…" : "Make my quiz";
}

function showQuestion() {
  const question = quiz.questions[questionIndex];
  const progress = Math.round((questionIndex / quiz.questions.length) * 100);
  selectedAnswer = null;
  answerChecked = false;
  answerFeedback.hidden = true;
  answerFeedback.replaceChildren();
  checkButton.hidden = false;
  checkButton.disabled = true;
  nextButton.hidden = true;
  nextButton.textContent = questionIndex === quiz.questions.length - 1 ? "See my results ✨" : "Next question →";
  document.getElementById("question-count-label").textContent = `${questionIndex + 1} of ${quiz.questions.length}`;
  document.getElementById("progress-bar").style.width = `${progress}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", String(progress));
  document.getElementById("question-number").textContent = `QUESTION ${String(questionIndex + 1).padStart(2, "0")}`;
  const questionText = document.getElementById("question-text");
  questionText.textContent = question.question;
  questionText.focus();
  optionsContainer.replaceChildren();

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.setAttribute("aria-pressed", "false");

    const marker = document.createElement("span");
    marker.className = "option-marker";
    marker.textContent = String.fromCharCode(65 + index);
    const text = document.createElement("span");
    text.className = "option-text";
    text.textContent = option;
    button.append(marker, text);
    button.addEventListener("click", () => selectAnswer(index));
    optionsContainer.append(button);
  });
}

function selectAnswer(index) {
  if (answerChecked) {
    return;
  }
  selectedAnswer = index;
  checkButton.disabled = false;
  optionsContainer.querySelectorAll(".answer-option").forEach((option, optionIndex) => {
    const selected = index === optionIndex;
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-pressed", String(selected));
  });
}

function checkAnswer() {
  if (selectedAnswer === null || answerChecked) {
    return;
  }
  answerChecked = true;
  const question = quiz.questions[questionIndex];
  const isCorrect = selectedAnswer === question.answerIndex;
  if (isCorrect) {
    score += 1;
  }

  optionsContainer.querySelectorAll(".answer-option").forEach((option, index) => {
    option.disabled = true;
    if (index === question.answerIndex) {
      option.classList.add("is-correct");
    } else if (index === selectedAnswer) {
      option.classList.add("is-incorrect");
    }
  });

  const feedbackTitle = document.createElement("strong");
  feedbackTitle.textContent = isCorrect ? "That’s right! ✨" : "Not quite — here’s why";
  const explanation = document.createElement("span");
  explanation.textContent = question.explanation;
  answerFeedback.className = `answer-feedback ${isCorrect ? "feedback-correct" : "feedback-incorrect"}`;
  answerFeedback.replaceChildren(feedbackTitle, explanation);
  answerFeedback.hidden = false;
  answerFeedback.focus();
  checkButton.hidden = true;
  nextButton.hidden = false;
  const progress = Math.round(((questionIndex + 1) / quiz.questions.length) * 100);
  document.getElementById("progress-bar").style.width = `${progress}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", String(progress));
}

function showResults() {
  const percentage = Math.round((score / quiz.questions.length) * 100);
  const sticker = document.getElementById("result-sticker");
  const title = document.getElementById("result-title");
  const message = document.getElementById("result-message");

  if (percentage === 100) {
    sticker.textContent = "🏆";
    title.textContent = "Absolutely brilliant!";
    message.textContent = "A perfect score — you really know your stuff.";
  } else if (percentage >= 60) {
    sticker.textContent = "🌟";
    title.textContent = "Look at you go!";
    message.textContent = "You’re building a great understanding. Keep that momentum!";
  } else {
    sticker.textContent = "🌱";
    title.textContent = "Every try helps you grow.";
    message.textContent = "Review what you learned and give it another go — you’ve got this.";
  }

  document.getElementById("result-score").textContent = `${score} / ${quiz.questions.length}`;
  showScreen("results");
  document.getElementById("result-title").focus();
}

quizForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setupError.hidden = true;
  const topic = topicInput.value.trim();
  const difficulty = quizForm.elements.difficulty.value;
  const questionCount = Number(quizForm.elements.questionCount.value);
  if (!topic) {
    setupError.textContent = "Add a topic first so TeacherAI knows what to quiz you on.";
    setupError.hidden = false;
    topicInput.focus();
    return;
  }

  setBusy(true);
  showScreen("loading");
  try {
    const result = await window.TeacherAI.api.request("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty, questionCount }),
    });
    quiz = result;
    questionIndex = 0;
    score = 0;
    document.getElementById("active-topic").textContent = result.topic;
    showScreen("question");
    showQuestion();
  } catch (error) {
    setupError.textContent = error instanceof TypeError
      ? "Could not reach TeacherAI. Make sure the backend is running and Ollama is open."
      : error.message;
    setupError.hidden = false;
    showScreen("setup");
  } finally {
    setBusy(false);
  }
});

checkButton.addEventListener("click", checkAnswer);
nextButton.addEventListener("click", () => {
  if (questionIndex === quiz.questions.length - 1) {
    showResults();
    return;
  }
  questionIndex += 1;
  showQuestion();
});

document.getElementById("retry-quiz").addEventListener("click", () => {
  questionIndex = 0;
  score = 0;
  showScreen("question");
  showQuestion();
});

document.getElementById("new-quiz").addEventListener("click", () => {
  setupError.hidden = true;
  showScreen("setup");
  topicInput.focus();
});
