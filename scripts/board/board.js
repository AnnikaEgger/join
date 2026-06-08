let todos = [];
let currentDraggedElement;

/**
 * Initializes the board by ensuring all default tasks are present, loading tasks from Firebase, and enabling pointer events for the board. This function is called when the board page is loaded to set up the initial state of the application.
 */
async function initBoard() {
  // await ensureAllDefaultTasksAreInBoard();
  await loadTasks();
  guardPage();
  enableAllPointerEvents("--board");
}

/**
 * Loads tasks from Firebase and updates the `todos` array.
 */
async function loadTasks() {
  todos = [];

  await checkIfAssignedContactStillExists();

  let response = await fetch(
    "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/tasks.json",
  );
  let data = await response.json();

  if (data) {
    fillTasksArray(data);
  }
  initDialogCloseOnClickOutside();
  lockScreenOrientation();
  initGlobalDragSettings();
  updateHTML();
}

/**
 * Fills the `todos` array with tasks from the Firebase data.
 *
 * @param {*} tasksObj - The object containing tasks from Firebase.
 */
function fillTasksArray(tasksObj) {
  let keys = Object.keys(tasksObj);

  for (let i = 0; i < keys.length; i++) {
    let id = keys[i];

    if (id === "dummy_placeholder") continue;

    let taskData = tasksObj[id];
    taskData.id = id;

    todos.push(taskData);
  }
}

/**
 * This function updates the HTML of the board by rendering each category of tasks based on the current state of the `todos` array. It calls the `renderCategory` function for each category, passing the appropriate parameters to display the tasks and handle search functionality.
 */
function updateHTML() {
  renderCategory("to do", "to do", "No tasks To do");
  renderCategory("in progress", "in progress", "No tasks in progress");
  renderCategory(
    "await feedback",
    "await feedback",
    "No tasks awaiting feedback",
  );
  renderCategory("done", "done", "No tasks done");
}

/**
 * Renders the tasks for a specific column in the board.
 *
 * @param {string} column - The column to render (e.g., "to do", "in progress").
 * @param {string} containerId - The ID of the HTML container element for the column.
 * @param {string} message - The message to display if no tasks are found for the column.
 */
function renderCategory(column, containerId, message) {
  let search = document.getElementById("search-input").value.toLowerCase();
  let container = document.getElementById(containerId);
  let filtered = filterTodosForCategory(column, search);

  if (search.length > 0 && filtered.length == 0) {
    container.parentElement.style.display = "none";
  } else {
    container.parentElement.style.display = "flex";
    drawCategoryContent(container, filtered, message);
  }
  checkSearchNoMatches(search);
}

/**
 * Filters todos for a specific category based on the search query.
 *
 * @param {string} column - The column to filter by.
 * @param {string} search - The search query.
 * @returns {Array} - The filtered array of todos.
 */
function filterTodosForCategory(column, search) {
  return todos.filter(
    (t) =>
      t.column == column &&
      (t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search)),
  );
}

/**
 * Draws the content for a specific category column.
 *
 * @param {HTMLElement} container - The container element for the category.
 * @param {Array} filtered - The filtered array of todos for the category.
 * @param {string} message - The message to display if no tasks are found.
 */
function drawCategoryContent(container, filtered, message) {
  container.innerHTML = filtered.length
    ? ""
    : generateEmptySectionHTML(message);

  filtered.forEach((t) => {
    let catColor = getCategoryColor(t.category);
    container.innerHTML += generateTodoHTML(t, catColor);
  });
}

/**
 * Returns the color for a given category.
 *
 * @param {parameter} category - The category for which to return a color.
 * @returns {string} The color for the given category.
 */
function getCategoryColor(category) {
  if (!category) return "gray";
  let cat = category.toLowerCase();
  if (cat.includes("story") || cat.includes("user")) return "#0038FF";
  if (cat.includes("technical") || cat.includes("task")) return "#1FD7C1";
  if (cat.includes("bug")) return "#FF1A1A";
  return "#FF7A00";
}

/**
 * Calculates subtask metrics and requests the progress bar HTML.
 *
 * @param {Object} todo - The current todo object from Firebase.
 * @return {string} The HTML string or an empty string.
 */
function generateProgressBarHTML(todo) {
  let subtasks = todo["subtasks"] || [];
  if (subtasks.length === 0) return "";

  let subtaskList = Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks);
  let done = subtaskList.filter(
    (s) => s.status === "done" || s.done === true,
  ).length;
  let total = subtaskList.length;
  let percentage = (done / total) * 100;

  return generateProgressHTML(done, total, percentage);
}

/**
 * Generates a consistent background color based on the contact's name.
 *
 * @param {string} name - Name of the contact.
 * @return {string} Hex color string.
 */
function getContactColor(name) {
  let colors = [
    "#FF7A00",
    "#6E52FF",
    "#9327FF",
    "#00BEE8",
    "#FF745E",
    "#FFA800",
  ];
  let index = (name.name.charCodeAt(0) || 0) % colors.length;
  return colors[index];
}

/**
 * Determines the correct priority icon path and gets the HTML string.
 *
 * @param {Object} todo - The current todo object from Firebase.
 * @return {string} HTML string of the image tag.
 */
function getPrioIconHTML(todo) {
  let prio = (todo["priority"] || "low").toLowerCase();
  let src = `../assets/icons/${prio}-prio-icon.svg`;

  if (prio === "urgent" || prio === "hoch")
    src = "../assets/icons/urgent-prio-icon.svg";
  if (prio === "medium" || prio === "mittel")
    src = "../assets/icons/medium-prio-icon-2.svg";

  return generatePrioIconHTML(src, prio);
}

/**
 * Checks if the search results match any tasks.
 *
 * @param {parameter} search - The search term.
 */
function checkSearchNoMatches(search) {
  let anyMatch = todos.some(
    (t) =>
      t.title.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search),
  );
  let msg = document.getElementById("search-message");
  if (msg)
    msg.innerHTML = !anyMatch && search.length > 0 ? "no tasks found." : "";
}

/**
 * Filters the tasks based on the current search term.
 */
function filterTasks() {
  updateHTML();
}
