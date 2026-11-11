function getCalculatorInput() {
  return document.querySelector(".main-input, .result-paragraph");
}

function insertCalculatorText(text) {
  const input = getCalculatorInput();
  if (!input) {
    return;
  }

  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  input.value = `${input.value.slice(0, start)}${text}${input.value.slice(end)}`;
  input.focus();
  input.setSelectionRange(start + text.length, start + text.length);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function concatenate(character) {
  if (typeof character === "string") {
    insertCalculatorText(character);
  }
}

function clearResult() {
  const input = getCalculatorInput();
  if (!input) {
    return;
  }

  input.value = "";
  input.focus();
  input.setSelectionRange(0, 0);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

document.querySelectorAll("[data-calculator-insert]").forEach((button) => {
  button.addEventListener("click", () => {
    insertCalculatorText(button.dataset.calculatorInsert);
  });
});
