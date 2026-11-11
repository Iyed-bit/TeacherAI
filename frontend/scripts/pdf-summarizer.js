const fileInput = document.getElementById("inpFile");
const uploadButton = document.getElementById("btnUpload");
const lessonInput = document.getElementById("resultText");
const summarizeButton = document.getElementById("summarizeButton");
const summaryOutput = document.getElementById("summaryOutput");

async function extractPdf(file) {
  const formData = new FormData();
  formData.append("pdfFile", file);
  const result = await window.TeacherAI.api.request("/api/pdf/extract", {
    method: "POST",
    body: formData,
  });
  if (typeof result.text !== "string" || !result.text.trim()) {
    throw new Error("No readable text was found in the PDF.");
  }
  return result.text.trim();
}

uploadButton.addEventListener("click", async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    summaryOutput.textContent = "Choose a PDF file first.";
    return;
  }

  uploadButton.disabled = true;
  summaryOutput.textContent = "Extracting text...";
  try {
    lessonInput.value = await extractPdf(file);
    summaryOutput.textContent = "Text extracted. Click Summarize Lesson to create a summary.";
  } catch (error) {
    console.error("PDF extraction failed:", error);
    summaryOutput.textContent = error.message;
  } finally {
    uploadButton.disabled = false;
  }
});

summarizeButton.addEventListener("click", async () => {
  summarizeButton.disabled = true;
  summaryOutput.textContent = "Preparing lesson...";
  try {
    const file = fileInput.files?.[0];
    const lesson = file ? await extractPdf(file) : lessonInput.value.trim();
    if (!lesson) {
      summaryOutput.textContent = "Choose a PDF or paste lesson text before summarizing.";
      return;
    }

    if (file) {
      lessonInput.value = lesson;
    }

    summaryOutput.textContent = "Summarizing lesson...";
    const result = await window.TeacherAI.api.request("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `Summarize this lesson for a student. Start with a short main idea, then give the key concepts as clear numbered points. Keep the summary accurate, concise, and based only on the lesson text.\n\nLesson:\n${lesson}`,
      }),
    });
    summaryOutput.textContent = result.output || "The AI returned an empty summary.";
  } catch (error) {
    console.error("Lesson summarization failed:", error);
    summaryOutput.textContent = error instanceof TypeError
      ? "Could not reach the TeacherAI server. Make sure the backend is running at http://localhost:3000."
      : error.message;
  } finally {
    summarizeButton.disabled = false;
  }
});
