document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".side-bar");
  const toggleButton = document.querySelector(".hamburger-button");
  if (!sidebar || !toggleButton) return;

  toggleButton.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("is-open");
    toggleButton.classList.toggle("is-open", isOpen);
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });
});