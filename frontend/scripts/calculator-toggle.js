document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".calculator-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".container")?.classList.toggle("transform-visible");
    });
  });
});
