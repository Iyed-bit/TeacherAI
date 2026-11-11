const chatInput = document.querySelector(".main-input");
const chatOutput = document.querySelector(".main-output");

async function sendRequest(prompt = null) {
  const content = prompt || chatInput?.value.trim();
  if (!content) {
    chatOutput.innerText = "Enter a question first.";
    return;
  }

  chatOutput.innerText = "Loading...";
  try {
    const result = await window.TeacherAI.api.request("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    chatOutput.innerText = result.output || "The AI returned an empty response.";
    if (chatInput) {
      chatInput.value = "";
    }
  } catch (error) {
    console.error("TeacherAI request failed:", error);
    chatOutput.innerText = error instanceof TypeError
      ? "Could not reach the TeacherAI server. Make sure the backend is running at http://localhost:3000."
      : error.message;
  }
}

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => sendRequest(button.dataset.prompt));
});

document.querySelector(".send-button")?.addEventListener("click", () => sendRequest());
chatInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendRequest();
  }
});
