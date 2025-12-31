let filter = "all";
let editId = null;
let openFolders = {}; // day__folder => true/false


/* Set today as default date */
window.onload = () => {
    const today = new Date();
    const localDate = today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    document.getElementById("dayInput").value = localDate;
};

/* SHOW / HIDE FOLDER INPUT */
function toggleFolder(show) {
    folderInput.style.display = show ? "block" : "none";
}

/* ADD TASK */
function addTask() {
    const title = taskInput.value.trim();
    const day = dayInput.value;

    const isFolderTask =
        document.querySelector('input[name="taskType"]:checked').value === "folder";

    let folder = "General";

    if (isFolderTask) {
        folder = folderInput.value.trim();
        if (!folder) {
            alert("Please enter folder name");
            return;
        }
    }

    if (!title || !day) return;

    addTaskDB({
        title,
        completed: false,
        day,
        folder
    });

    taskInput.value = "";
    setTimeout(loadTasks, 50);
}

/* TOGGLE DONE */
function toggleTask(id) {
    getAllTasks(tasks => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        updateTaskDB(task);
        setTimeout(loadTasks, 50);
    });
}

/* DELETE TASK */
function deleteTask(id) {
    deleteTaskDB(id);
    setTimeout(loadTasks, 50);
}

/* FILTER */
function setFilter(f) {
    filter = f;
    loadTasks();
}

/* EDIT MODE */
function startEdit(id) {
    editId = id;
    loadTasks();
}

function cancelEdit() {
    editId = null;
    loadTasks();
}

function saveEdit(e, id) {
    e.preventDefault();
    const newTitle = document.getElementById("editInput").value.trim();
    if (!newTitle) return;

    getAllTasks(tasks => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        task.title = newTitle;
        updateTaskDB(task);
        editId = null;
        setTimeout(loadTasks, 50);
    });
}

/* LOAD & RENDER (DAY → FOLDER → TASK) */
function loadTasks() {
    getAllTasks(tasks => {
        taskList.innerHTML = "";

        /* STATS */
        const completed = tasks.filter(t => t.completed).length;
        stats.innerText = `${completed} / ${tasks.length} Completed`;
        progress.style.width =
            tasks.length ? (completed / tasks.length) * 100 + "%" : "0%";

        /* GROUP BY DAY → FOLDER */
        const grouped = {};
        tasks.forEach(t => {
            if (!grouped[t.day]) grouped[t.day] = {};
            if (!grouped[t.day][t.folder]) grouped[t.day][t.folder] = [];
            grouped[t.day][t.folder].push(t);
        });

        /* RENDER */
        Object.keys(grouped).sort().forEach(day => {
            const dayHeader = document.createElement("h4");
            dayHeader.style.margin = "15px 0 5px";
            dayHeader.style.color = "#555";
            dayHeader.textContent = `📅 ${day}`;
            taskList.appendChild(dayHeader);

            Object.keys(grouped[day]).forEach(folder => {
                const folderKey = `${day}__${folder}`;

                if (!(folderKey in openFolders)) {
                    openFolders[folderKey] = false; // closed by default
                }

                /* FOLDER HEADER */
                const folderHeader = document.createElement("div");
                folderHeader.style.cursor = "pointer";
                folderHeader.style.margin = "8px 0 5px";
                folderHeader.innerHTML = `
                    <strong style="color:#667eea;">
                        ${openFolders[folderKey] ? "📂" : "📁"} ${folder}
                    </strong>
                `;

                folderHeader.onclick = () => {
                    openFolders[folderKey] = !openFolders[folderKey];
                    loadTasks();
                };

                taskList.appendChild(folderHeader);

                /* TASK CONTAINER */
                const folderTasks = document.createElement("div");
                folderTasks.style.marginLeft = "12px";
                folderTasks.style.display =
                    openFolders[folderKey] ? "block" : "none";
                taskList.appendChild(folderTasks);

                grouped[day][folder]
                    .filter(t =>
                        filter === "all" ||
                        (filter === "completed" && t.completed) ||
                        (filter === "pending" && !t.completed)
                    )
                    .forEach(task => {
                        const li = document.createElement("li");

                        if (editId === task.id) {
                            li.innerHTML = `
                                <form class="edit-form"
                                      onsubmit="saveEdit(event, ${task.id})">
                                    <input id="editInput"
                                           value="${task.title}">
                                    <button class="edit-btn">Update</button>
                                    <button type="button"
                                            class="delete-btn"
                                            onclick="cancelEdit()">
                                        Cancel
                                    </button>
                                </form>
                            `;
                        } else {
                            li.innerHTML = `
                                <div style="display:flex; gap:10px;">
                                    <input type="checkbox"
                                        ${task.completed ? "checked" : ""}
                                        onchange="toggleTask(${task.id})">
                                    <span class="${task.completed ? "done" : ""}">
                                        ${task.title}
                                    </span>
                                </div>
                                <div style="display:flex; gap:6px;">
                                    <button class="edit-btn"
                                            onclick="startEdit(${task.id})">
                                        Edit
                                    </button>
                                    <button class="delete-btn"
                                            onclick="deleteTask(${task.id})">
                                        Delete
                                    </button>
                                </div>
                            `;
                        }

                        folderTasks.appendChild(li);
                    });
            });
        });

        if (!tasks.length) {
            const li = document.createElement("li");
            li.textContent = "No tasks added";
            taskList.appendChild(li);
        }
    });
}

/* =========================
   AUTO DAILY DATE UPDATE
   ========================= */

function setTodayDate() {
    const now = new Date();

    const localDate =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");

    document.getElementById("dayInput").value = localDate;
}

function scheduleMidnightUpdate() {
    const now = new Date();

    const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0
    );

    const msUntilMidnight = nextMidnight - now;

    setTimeout(() => {
        setTodayDate();
        scheduleMidnightUpdate(); // repeat every day
    }, msUntilMidnight);
}

/* Run on load */
window.addEventListener("load", () => {
    setTodayDate();
    scheduleMidnightUpdate();
});
