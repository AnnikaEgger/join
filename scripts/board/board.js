/**
 * Global cache storing all active task objects fetched from the database.
 * @type {Array<Object>}
 */
let todos = [];

/**
 * Stores the unique database ID string of the task currently being dragged.
 * @type {string|undefined}
 */
let currentDraggedElement;

/**
 * Initializes the board by ensuring all default tasks are present, 
 * loading tasks from Firebase, and enabling pointer events for the board.
 * * @async
 * @returns {Promise<void>}
 */
async function initBoard() {
  await loadTasks();
  guardPage();
  enableAllPointerEvents("--board");
}

/**
 * Loads tasks from Firebase and updates the global `todos` array.
 * * @async
 * @returns {Promise<void>}
 */
async function loadTasks() {
  todos = [];
  await checkIfAssignedContactStillExists();

  let response = await fetch(BASE_URL + "tasks.json");
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
 * Fills the global `todos` array with mapped task items from the raw Firebase data object.
 *
 * @param {Object.<string, Object>} tasksObj - Key-value map representing the raw Firebase database collection.
 * @returns {void}
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
 * Re-renders all board columns from the current task data.
 *
 * @returns {void}
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
 * Renders the tasks for a specific column in the board based on search filtering.
 *
 * @param {string} column - Target tracking group name (e.g., "to do", "in progress").
 * @param {string} containerId - The DOM element ID string where cards should be injected.
 * @param {string} message - Informative empty state message to display if no match is found.
 * @returns {void}
 */
function renderCategory(column, containerId, message) {
  let search = document.getElementById("search-input").value.toLowerCase();
  let container = document.getElementById(containerId);
  let filtered = filterTodosForCategory(column, search);

  container.parentElement.style.display = "flex";
  drawCategoryContent(container, filtered, message);

  checkSearchNoMatches(search);
}

/**
 * Filters todos for a specific category based on status column and textual user search queries.
 *
 * @param {string} column - The exact column value assignment to extract.
 * @param {string} search - Low-case normalized character user search criteria string.
 * @returns {Array<Object>} Mapped array list subset containing matches.
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
 * Draws the content for a specific category column by clearing and appending child layouts.
 *
 * @param {HTMLElement} container - DOM reference block container wrapper location.
 * @param {Array<Object>} filtered - Clean structured collection array representing matched targets.
 * @param {string} message - Text payload to pass to the empty-state rendering handler fallback.
 * @returns {void}
 */
function drawCategoryContent(container, filtered, message) {
  container.innerHTML = filtered.length
    ? ""
    : generateEmptySectionHTML(message);

  filtered.forEach((todo) => {
    renderCategoryContent(todo, container);
  });
}

/**
 * Renders one task card layout blueprint into its parent column category context.
 *
 * @param {Object} todo - The current structural task element data packet to unpack.
 * @param {HTMLElement} container - Targeted DOM target container to append output text parameters onto.
 * @returns {void}
 */
function renderCategoryContent(todo, container) {
  let catColor = getCategoryColor(todo.category);
  let progressBar = generateProgressBarHTML(todo);
  let badgesHTML = generateAssignedBadgesHTML(todo);
  let prioIconHTML = getPrioIconHTML(todo);

  container.innerHTML += generateTodoHTML(
    todo,
    catColor,
    progressBar,
    badgesHTML,
    prioIconHTML,
  );
}

/**
 * Selects and returns an explicit layout badge coloring configuration code according to task category.
 *
 * @param {string|undefined} category - Context tag definition name text string.
 * @returns {string} HEX layout code representing the color mapping profile.
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
 * Calculates subtask validation metrics and requests dynamic target layout loading.
 *
 * @param {Object} todo - The active single target element array scope data packet tracking root.
 * @param {Array<Object>|Object} [todo.subtasks] - Optional collection map structure array containing child requirements.
 * @returns {string} HTML component design code block layout schema text.
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
 * Generates a consistent background color mapping calculation based on a contact's first name index character.
 *
 * @param {Object} name - Target contact context metadata wrapper tracking item.
 * @param {string} name.name - Full literal alphabetic identifier text element parameters.
 * @returns {string} The final target color HEX hex string formatting notation block.
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
 * Determines the correct local assets image directory source and tracking configurations.
 *
 * @param {Object} todo - Task payload container framework root tracking target.
 * @param {string} [todo.priority] - Active priority level state assignment.
 * @returns {string} Completed image item token inline asset layout definition logic markup.
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
 * Verifies whether any visible task globally matches the active search parameters query.
 *
 * @param {string} search - Evaluated criteria normal string mapping input.
 * @returns {void}
 */
function checkSearchNoMatches(search) {
  let anyMatch = todos.some(
    (t) =>
      (t.title || "").toLowerCase().includes(search) ||
      (t.description || "").toLowerCase().includes(search),
  );
}

/**
 * Re-renders the board view representation layout after input filters modification events trigger.
 *
 * @returns {void}
 */
function filterTasks() {
  updateHTML();
}