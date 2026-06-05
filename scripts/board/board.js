let todos = [];
let currentDraggedElement;

/**
 * Initializes the board by ensuring all default tasks are present, loading tasks from Firebase, and enabling pointer events for the board. This function is called when the board page is loaded to set up the initial state of the application.
 */
async function initBoard() {
  await ensureAllDefaultTasksAreInBoard();
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

let touchTimeout;
let isLongPress = false;
let startX, startY;

/**
 * Handles the start of a drag operation, including both mouse and touch events. For touch events, it initiates a long press detection to differentiate between scrolling and dragging on mobile devices.
 *
 * @param {parameter} event - The drag start event, which can be either a mouse or touch event.
 * @param {string} id - The ID of the task being dragged, used to identify which task is being moved during the drag and drop operation.
 */
function startDragging(event, id) {
  currentDraggedElement = id;
  let card = event.target.closest(".card");

  if (event.type === "touchstart") {
    initMobileTouch(event, card);
  } else if (card) {
    card.classList.add("dragging");
  } //
}

/**
 * Initializes the mobile touch handling for drag operations.
 *
 * @param {parameter} event - The touch start event.
 * @param {parameter} card - The card element being dragged.
 */
function initMobileTouch(event, card) {
  startX = event.touches[0].clientX;
  startY = event.touches[0].clientY;
  isLongPress = false; //

  touchTimeout = setTimeout(() => {
    isLongPress = true; //
    activateMobileDragStyle(card);
    if (navigator.vibrate) navigator.vibrate(50);
  }, 200);
}

/**
 * Activates the mobile drag style for the specified card.
 *
 * @param {parameter} card - The card element for which to activate drag style.
 */
function activateMobileDragStyle(card) {
  if (card) {
    //
    card.classList.add("dragging");
    card.style.pointerEvents = "none";
  }
}

/**
 * Allows drop and triggers auto-scroll on desktop during dragging.
 *
 * @param {parameter} ev - The drag over event, which is used to allow dropping of the dragged element and to trigger automatic scrolling of the page when dragging near the edges of the viewport on desktop devices.
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Checks mouse position and scrolls if near top or bottom.
 *
 * @param {number} clientY - The current vertical position of the mouse cursor, used to determine if the window should automatically scroll when dragging a task near the edges of the viewport on desktop devices.
 */
function handleDesktopScroll(clientY) {
  const threshold = 120;
  const speed = 50;

  if (clientY < threshold) {
    window.scrollBy(0, -speed);
  } else if (clientY > window.innerHeight - threshold) {
    window.scrollBy(0, speed);
  }
}

/**
 * Prevents the red "blocked" cursor globally while dragging.
 *
 * This function adds an event listener for the "dragover" event on the entire document, which prevents the default behavior that would show a "blocked" cursor when dragging elements over non-droppable areas. It also calls the `handleDesktopScroll` function to enable automatic scrolling when dragging near the edges of the viewport on desktop devices.
 */
function initGlobalDragSettings() {
  document.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    handleDesktopScroll(ev.clientY);
  });
}

/**
 * Moves the card with the finger and handles automatic page scrolling and column highlighting.
 *
 * @param {parameter} event - The touch move event.
 */
function handleTouchMove(event) {
  let touch = event.touches ? event.touches[0] : null;
  if (!isLongPress || !touch) {
    if (
      touch &&
      (Math.abs(touch.clientX - startX) > 10 ||
        Math.abs(touch.clientY - startY) > 10)
    ) {
      clearTimeout(touchTimeout);
    }
    return;
  }
  event.preventDefault();
  let card = event.target.closest(".card");
  if (card) {
    card.style.position = "fixed";
    card.style.left = `${touch.clientX - card.offsetWidth / 2}px`;
    card.style.top = `${touch.clientY - card.offsetHeight / 2}px`;
    checkAutoScroll(touch.clientY);
    handleMobileHighlight(touch.clientX, touch.clientY);
  }
}

/**
 * Manually highlights the column container under the user's finger on mobile devices.
 *
 * @param {number} x - The current horizontal position of the finger.
 * @param {number} y - The current vertical position of the finger.
 */
function handleMobileHighlight(x, y) {
  let element = document.elementFromPoint(x, y);
  let currentContainer = element ? element.closest(".card-container") : null;

  document
    .querySelectorAll(".card-container")
    .forEach((c) => c.classList.remove("drag-area-highlight"));

  if (currentContainer && currentContainer.id) {
    currentContainer.classList.add("drag-area-highlight");
  }
}

/**
 * Automatically scrolls the window when the finger is near the top or bottom edge.
 *
 * @param {number} clientY - The current vertical position of the finger.
 */
function checkAutoScroll(clientY) {
  let speed = 100;
  let threshold = 100;

  if (clientY < threshold) {
    window.scrollBy(0, -speed);
  } else if (clientY > window.innerHeight - threshold) {
    window.scrollBy(0, speed);
  }
}

/**
 * Handles the end of a touch event and triggers the drop logic.
 *
 * @param {parameter} event - The touch end event.
 */
function stopDragging(event) {
  clearTimeout(touchTimeout);
  document
    .querySelectorAll(".card-container")
    .forEach((c) => c.classList.remove("drag-area-highlight"));

  event.target.classList.remove("dragging");
  let card = event.target.closest(".card");
  if (card) card.style.position = "";

  if (event.type === "touchend" && isLongPress) {
    let touch = event.changedTouches[0];
    let element = document.elementFromPoint(touch.clientX, touch.clientY);
    let columnContainer = element ? element.closest(".card-container") : null;
    if (columnContainer) moveTo(columnContainer.id);
  }
}

/**
 * Moves a task to a different column and updates Firebase.
 *
 * @param {string} column - The target column.
 */
function moveTo(column) {
  let task = todos.find((t) => t.id === currentDraggedElement);
  if (task) {
    task["column"] = column;
    updateHTML();
    updateTaskInFirebase(task);
  }
}

/**
 * Highlights a drag area.
 *
 * @param {parameter} id - The ID of the drag area to highlight.
 */
function highlight(id) {
  document.getElementById(id).classList.add("drag-area-highlight");
}

/**
 * Removes the highlight from a drag area.
 *
 * @param {parameter} id - The ID of the drag area to remove the highlight from.
 */
function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-area-highlight");
}
