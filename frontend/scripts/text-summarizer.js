const pdfInput = document.getElementById("inpFile");
const lessonText = document.getElementById("resultText");
const summarizeLessonButton = document.getElementById("btnUpload");
const textSummary = document.querySelector(".sum-output");

async function summarizeLesson() {
  let lesson = lessonText.value.trim();
  const file = pdfInput.files?.[0];
  if (file) {
    const formData = new FormData();
    formData.append("pdfFile", file);
    const extracted = await window.TeacherAI.api.request("/api/pdf/extract", {
      method: "POST",
      body: formData,
    });
    if (typeof extracted.text !== "string" || !extracted.text.trim()) {
      throw new Error("No readable text was found in the PDF.");
    }
    lesson = extracted.text.trim();
    lessonText.value = lesson;
  }

  if (!lesson) {
    textSummary.innerText = "Choose a PDF or enter lesson text first.";
    return;
  }

  const content = `Summarize the lesson provided below. Begin with the main idea of the lesson, followed by its key points listed in a numbered format:

Main Idea of the lesson:
Type the main idea of the lesson here

Lesson Overview and keypoints:

This lesson covers [topic]. Your task is to summarize the lesson by highlighting the main points in the following structured format:

1.[Main Point 1]
2.[Main Point 2]
3.[Main Point 3]
.
.
.
n.[Main Point n]
Ensure your summary is concise yet comprehensive, capturing the core concepts and insights presented in the lesson.

${lesson}`;
  textSummary.innerText = "Summarizing...";
  const result = await window.TeacherAI.api.request("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  textSummary.innerText = result.output || "The AI returned an empty response.";
}

summarizeLessonButton.addEventListener("click", () => {
  summarizeLesson().catch((error) => {
    console.error("Lesson summarization failed:", error);
    textSummary.innerText = error.message;
  });
});
