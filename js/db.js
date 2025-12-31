let db;

const request = indexedDB.open("TodoDB", 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore("tasks", {
        keyPath: "id",
        autoIncrement: true
    });
};

request.onsuccess = (e) => {
    db = e.target.result;
    loadTasks(); // 🔴 only place loadTasks is called initially
};

function addTaskDB(task) {
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").add(task);
}

function getAllTasks(cb) {
    const tx = db.transaction("tasks", "readonly");
    const req = tx.objectStore("tasks").getAll();
    req.onsuccess = () => cb(req.result);
}

function updateTaskDB(task) {
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").put(task);
}

function deleteTaskDB(id) {
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").delete(id);
}
