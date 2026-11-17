window.addEventListener("load", () => {
    const storageKey = "teacherai.timeTracker.tasks";
    const form = document.querySelector("#task-form");
    const input = document.querySelector("#task-input");
    const list = document.querySelector("#tasks");
    const storageStatus = document.querySelector("#task-storage-status");
    let tasks = [];
    let storageReady = true;

    function showStorageError(message) {
        storageStatus.textContent = message;
        storageStatus.hidden = false;
    }

    function hideStorageError() {
        storageStatus.textContent = "";
        storageStatus.hidden = true;
    }

    function readTasks(value) {
        const savedTasks = JSON.parse(value || "[]");
        if (!Array.isArray(savedTasks) || savedTasks.some((task) => (
            !task
            || typeof task.id !== "string"
            || typeof task.name !== "string"
            || !Number.isFinite(task.elapsedMs)
            || task.elapsedMs < 0
            || typeof task.running !== "boolean"
            || (task.running && !Number.isFinite(task.startedAt))
        ))) {
            throw new Error("Saved time tracker data has an unexpected format.");
        }
        return savedTasks;
    }

    function persistTasks() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(tasks));
            hideStorageError();
            return true;
        } catch (error) {
            console.error("Could not save time tracker tasks:", error);
            showStorageError("Your latest changes could not be saved in this browser.");
            return false;
        }
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return [hours, minutes, seconds]
            .map((value) => String(value).padStart(2, "0"))
            .join(":");
    }

    function elapsedTime(task, now = Date.now()) {
        return task.elapsedMs + (task.running ? Math.max(0, now - task.startedAt) : 0);
    }

    function renderTasks() {
        list.replaceChildren();

        for (const task of tasks) {
            const taskElement = document.createElement("div");
            taskElement.classList.add("task");

            const content = document.createElement("div");
            content.classList.add("content");

            const nameInput = document.createElement("input");
            nameInput.classList.add("text");
            nameInput.type = "text";
            nameInput.value = task.name;
            nameInput.readOnly = true;
            content.appendChild(nameInput);
            taskElement.appendChild(content);

            const counter = document.createElement("div");
            counter.classList.add("counter");

            const time = document.createElement("div");
            time.classList.add("time");
            time.textContent = formatTime(elapsedTime(task));
            counter.appendChild(time);

            const controls = document.createElement("div");
            controls.classList.add("controls");
            const startButton = document.createElement("button");
            startButton.classList.add("start");
            startButton.type = "button";
            startButton.textContent = "Start";
            const stopButton = document.createElement("button");
            stopButton.classList.add("stop");
            stopButton.type = "button";
            stopButton.textContent = "Stop";
            const resetButton = document.createElement("button");
            resetButton.classList.add("reset");
            resetButton.type = "button";
            resetButton.textContent = "Reset";
            controls.append(startButton, stopButton, resetButton);
            counter.appendChild(controls);
            taskElement.appendChild(counter);

            const actions = document.createElement("div");
            actions.classList.add("actions");
            const editButton = document.createElement("button");
            editButton.classList.add("edit");
            editButton.type = "button";
            editButton.textContent = "Edit Task";
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete Task";
            actions.append(editButton, deleteButton);
            taskElement.appendChild(actions);
            list.appendChild(taskElement);

            startButton.addEventListener("click", () => {
                if (task.running) return;
                task.running = true;
                task.startedAt = Date.now();
                persistTasks();
                updateTimers();
            });

            stopButton.addEventListener("click", () => {
                if (!task.running) return;
                task.elapsedMs = elapsedTime(task);
                task.running = false;
                delete task.startedAt;
                persistTasks();
                updateTimers();
            });

            resetButton.addEventListener("click", () => {
                task.elapsedMs = 0;
                if (task.running) task.startedAt = Date.now();
                persistTasks();
                updateTimers();
            });

            editButton.addEventListener("click", () => {
                if (nameInput.readOnly) {
                    nameInput.readOnly = false;
                    nameInput.focus();
                    editButton.textContent = "Save";
                    return;
                }

                const newName = nameInput.value.trim();
                if (!newName) {
                    nameInput.value = task.name;
                } else {
                    task.name = newName.charAt(0).toUpperCase() + newName.slice(1);
                    nameInput.value = task.name;
                    persistTasks();
                }
                nameInput.readOnly = true;
                editButton.textContent = "Edit Task";
            });

            deleteButton.addEventListener("click", () => {
                tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
                persistTasks();
                renderTasks();
            });
        }
    }

    function updateTimers() {
        const now = Date.now();
        const timeElements = list.querySelectorAll(".task .time");
        tasks.forEach((task, index) => {
            if (timeElements[index]) {
                timeElements[index].textContent = formatTime(elapsedTime(task, now));
            }
        });
    }

    try {
        tasks = readTasks(localStorage.getItem(storageKey));
        renderTasks();
    } catch (error) {
        storageReady = false;
        console.error("Could not load time tracker tasks:", error);
        showStorageError("Saved tasks could not be read. They have been left untouched; clear this browser's saved time-tracker data to start fresh.");
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!storageReady) return;

        const name = input.value.trim();
        if (!name) {
            alert("Please add a task");
            return;
        }

        tasks.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            elapsedMs: 0,
            running: false,
        });
        input.value = "";
        persistTasks();
        renderTasks();
    });

    window.addEventListener("storage", (event) => {
        if (event.key !== storageKey) return;
        try {
            tasks = readTasks(event.newValue);
            storageReady = true;
            hideStorageError();
            renderTasks();
        } catch (error) {
            storageReady = false;
            console.error("Could not sync time tracker tasks:", error);
            showStorageError("Saved tasks could not be read. They have been left untouched.");
        }
    });

    window.setInterval(updateTimers, 1000);
});
