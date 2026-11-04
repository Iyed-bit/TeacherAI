(() => {
  const storageKey = "teacherai-theme";
  const body = document.body;
  const toggle = document.getElementById("toggleDark");
  const themedImages = document.querySelectorAll("[data-theme-light][data-theme-dark]");
  const sidebar = document.querySelector(".side-bar");

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(storageKey) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  };

  const applyTheme = (theme) => {
    const isLight = theme === "light";
    body.classList.toggle("light-mode", isLight);
    if (sidebar) {
      sidebar.classList.toggle("light-mode", isLight);
    }
    themedImages.forEach((image) => {
      image.src = image.dataset[isLight ? "themeLight" : "themeDark"];
    });

    if (toggle) {
      toggle.classList.toggle("bi-brightness-high-fill", !isLight);
      toggle.classList.toggle("bi-moon", isLight);
      toggle.setAttribute("role", "button");
      toggle.setAttribute("tabindex", "0");
      toggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    }
  };

  applyTheme(getSavedTheme());

  if (toggle) {
    const switchTheme = () => {
      const nextTheme = body.classList.contains("light-mode") ? "dark" : "light";
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // Keep the selected theme for this page even if storage is unavailable.
      }
      applyTheme(nextTheme);
    };

    toggle.addEventListener("click", switchTheme);
    toggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        switchTheme();
      }
    });
  }
})();
