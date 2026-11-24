(() => {
  const storageKey = "teacherai.timeTracker.tasks";
  const currentScript = document.currentScript;
  if (!currentScript?.src) {
    console.error("Could not locate the time tracker widget script URL.");
    return;
  }

  const widgetUrl = new URL("../styles/time-tracker-widget.css", currentScript.src);
  const trackerUrl = new URL("../timeTracker/home.html", currentScript.src);
  let storageErrorReported = false;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = widgetUrl.href;
  document.head.appendChild(stylesheet);

  function startWidget() {
    const widget = document.createElement("aside");
    widget.id = "time-tracker-widget";
    widget.setAttribute("aria-label", "Running time tracker tasks");

    const title = document.createElement("a");
    title.href = trackerUrl.href;
    title.textContent = "Time Tracker";
    widget.appendChild(title);

    const taskList = document.createElement("ul");
    widget.appendChild(taskList);
    document.body.appendChild(widget);

    function formatElapsedTime(task, now) {
      const elapsedMs = task.elapsedMs
        + Math.max(0, now - task.startedAt);
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function readRunningTasks() {
      try {
        const tasks = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (!Array.isArray(tasks) || tasks.some((task) => (
          !task
          || typeof task.name !== "string"
          || !Number.isFinite(task.elapsedMs)
          || task.elapsedMs < 0
          || typeof task.running !== "boolean"
          || (task.running && !Number.isFinite(task.startedAt))
        ))) {
          throw new Error("Saved time tracker data has an unexpected format.");
        }
        return tasks.filter((task) => task.running);
      } catch (error) {
        if (!storageErrorReported) {
          console.error("Could not read running time tracker tasks:", error);
          storageErrorReported = true;
        }
        return [];
      }
    }

    function render() {
      const now = Date.now();
      const runningTasks = readRunningTasks().slice(0, 4);
      storageErrorReported = false;
      taskList.replaceChildren();

      runningTasks.forEach((task) => {
        const item = document.createElement("li");
        const words = task.name.trim().split(/\s+/).filter(Boolean);
        const taskLabel = words.slice(0, 3).join(" ")
          + (words.length > 3 ? "…" : "");
        const elapsedTime = formatElapsedTime(task, now);
        item.textContent = `- ${elapsedTime}${taskLabel ? `: ${taskLabel}` : ""}`;
        item.title = `${task.name}: ${elapsedTime}`;
        taskList.appendChild(item);
      });
      if (runningTasks.length === 0) {
        const emptyState = document.createElement("li");
        emptyState.textContent = "No tasks running";
        taskList.appendChild(emptyState);
      }
    }

    window.addEventListener("storage", (event) => {
      if (event.key === storageKey || event.key === null) render();
    });
    window.setInterval(render, 1000);
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWidget, { once: true });
  } else {
    startWidget();
  }
})();
