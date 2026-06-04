/**
 * edit-task.js
 * Handles edit task dialog behavior, Firebase task updates, and default task synchronization.
 */

/**
 * Opens the dialog for adding a new task and initializes the add task dialog state.
 * @param {string} column - The task column to assign when the task is created.
 */
function openAddTaskDialog(column) {
  const ADD_TASK_DIALOG = document.getElementById("addTaskDialog");
  ADD_TASK_DIALOG.showModal();
  ADD_TASK_DIALOG.classList.add("show-dialog");

  initAddTask("--add-task-dialog");

  addTaskColumn = column;
}

/**
 * Closes the dialog for adding a new task.
 */
function closeAddTaskDialog() {
  const ADD_TASK_DIALOG = document.getElementById("addTaskDialog");

  ADD_TASK_DIALOG.classList.remove("show-dialog");
  setTimeout(() => {
    ADD_TASK_DIALOG.close();
  }, 150);

  clearTask("--add-task-dialog");
}

/**
 * Adds a click listener to the add task dialog backdrop to close the dialog.
 */
const ADD_TASK_DIALOG = document.getElementById("addTaskDialog");
ADD_TASK_DIALOG.addEventListener("click", (event) => {
  if (event.target === ADD_TASK_DIALOG) {
    closeAddTaskDialog();
  }
});

/**
 * Deletes a task from Firebase and updates the board display.
 * @param {string} taskId - The ID of the task to delete.
 */
async function deleteTask(taskId) {
  disableButtonWhileLoading("delete-task-btn");
  disableButtonWhileLoading("edit-task-btn");

  await deleteTaskFromFirebase(taskId);
  await loadTasks();
  closeTaskDialog();

  enableButton("delete-task-btn");
  enableButton("edit-task-btn");
}

/**
 * Sends a DELETE request to Firebase to remove a specific task.
 * @param {string} taskId - The ID of the task to delete from Firebase.
 * @returns {Promise<Object>} The Firebase response JSON.
 */
async function deleteTaskFromFirebase(taskId) {
  let response = await fetch(BASE_URL + "/tasks/" + taskId + ".json", {
    method: "DELETE",
  });

  return await response.json();
}

/**
 * Initializes the edit task dialog state and loads contacts and categories.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
async function initEditTask(id) {
  contactsOptions = [];
  categoriesArr = [];
  subtasksArr = [];
  assignedContacts = [];

  disablePastDates(id);

  initContacts(id);
  initCategories(id);

  registerEnterHandlers(id);
  addEventListeners(id);

  enableAllPointerEvents("taskDialog");
}

/**
 * Loads contact data for the edit task dialog.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
async function initContacts(id) {
  await getContacts();
  await getUsers();
  filteredContacts = contactsOptions;
  renderContactOptions(id);
}

/**
 * Loads category data for the edit task dialog.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
async function initCategories(id) {
  await getCategories();
  renderSelectedCategory(id);
  renderCategories(id);
}

/**
 * Opens edit mode for a specific task and renders the edit form.
 * @param {string} taskId - The ID of the task to edit.
 */
async function openTaskEditMode(taskId) {
  disableButtonWhileLoading("edit-task-btn");
  disableButtonWhileLoading("delete-task-btn");

  const TASK_DIALOG = document.getElementById("taskDialog");

  let task = await getTaskFromFirebase(taskId);

  TASK_DIALOG.innerHTML = taskEditModeTemplate(task, taskId);
  addTaskFormEventListeners("--edit-task");

  selectedCategory = task.category;
  setPriority(task.priority, "--edit-task");
  await initEditTask("--edit-task");
  renderAssignedContactsEditMode(task);
  renderEditModeSubtasks(task);
}

/**
 * Retrieves a task from Firebase.
 * @param {string} taskId - The ID of the task to retrieve.
 * @returns {Promise<Object>} The task data from Firebase.
 */
async function getTaskFromFirebase(taskId) {
  let response = await fetch(BASE_URL + "/tasks/" + taskId + ".json");
  return await response.json();
}

/**
 * Renders the subtasks for the edit mode and updates the subtasks array.
 * @param {Object} task - The task object containing subtasks.
 */
function renderEditModeSubtasks(task) {
  if (task.subtasks) {
    subtasksArr.push(...task.subtasks);
    renderSubtasks("--edit-task");
  }
}

/**
 * Renders the assigned contacts for the edit mode.
 * @param {Object} task - The task object containing assigned contacts.
 */
function renderAssignedContactsEditMode(task) {
  if (task.assigned_contacts) {
    assignedContacts.push(...task.assigned_contacts);
    renderAssignedContacts("--edit-task");
  }
}

/**
 * Submits the edited task data to Firebase after validation.
 * @param {Event} event - The submit event triggered by the edit form.
 * @param {string} column - The column to which the task belongs.
 * @param {boolean} defaultTask - Whether the task is a default task.
 * @param {string} taskId - The ID of the task to edit.
 */
async function submitEditedTask(event, column, defaultTask, taskId) {
  const TASK_FORM = document.getElementById("task-form--edit-task");
  event.preventDefault();

  if (
    TASK_FORM.checkValidity() &&
    selectedCategory !== "Select task category"
  ) {
    disableButtonWhileLoading("task-edit-ok-btn");
    await putEditedTaskToFirebase(column, defaultTask, taskId);
    await loadTasks();
    openTaskDialog(taskId);
  }
}

/**
 * Sends a PUT request to Firebase to update a specific task.
 * @param {string} column - The column to which the task belongs.
 * @param {boolean} defaultTask - Whether the task is a default task.
 * @param {string} taskId - The ID of the task to update.
 * @returns {Promise<Object>} The Firebase response JSON.
 */
async function putEditedTaskToFirebase(column, defaultTask, taskId) {
  let task = await fetch(BASE_URL + "/tasks/" + taskId + ".json", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collectEditedTaskData(column, defaultTask, taskId)),
  });
  return await task.json();
}

/**
 * Collects the edited task data for submission to Firebase.
 * @param {string} column - The column to which the task belongs.
 * @param {boolean} defaultTask - Whether the task is a default task.
 * @param {string} taskId - The ID of the task being edited.
 * @returns {Object} The edited task data.
 */
function collectEditedTaskData(column, defaultTask, taskId) {
  const title = document.getElementById("task-title--edit-task").value;
  const description = document.getElementById(
    "task-description--edit-task",
  ).value;
  const dueDate = document.getElementById("task-due-date--edit-task").value;

  return {
    title: title,
    description: description,
    due_date: dueDate,
    priority: priority,
    assigned_contacts: assignedContacts,
    category: selectedCategory,
    subtasks: subtasksArr,
    column: column,
    default_task: defaultTask,
  };
}

let defaultTasks = [];

/**
 * Loads default tasks from Firebase into the local defaultTasks array.
 * @async
 */
async function getDefaultTasksFromFirebase() {
  defaultTasks = [];

  let response = await fetch(BASE_URL + "default_tasks" + ".json");
  let responseToJson = await response.json();
  defaultTasks.push(...responseToJson);
}

/**
 * Posts all loaded default tasks into the tasks collection in Firebase.
 * @async
 */
async function postDefaultTasksIntoTasksInFirebase() {
  for (let index = 0; index < defaultTasks.length; index++) {
    await fetch(BASE_URL + "tasks" + ".json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultTasks[index]),
    });
  }
}

/**
 * Deletes all existing default tasks in the tasks collection in Firebase.
 * @async
 */
async function deleteExistingDefaultTasksInTasksInFirebase() {
  let response = await fetch(BASE_URL + "tasks" + ".json");
  let responseToJson = await response.json();

  Object.entries(responseToJson).forEach(async ([id, task]) => {
    if (task.default_task === true) {
      await deleteTaskFromFirebase(id);
    }
  });
}

/**
 * Ensures all default tasks are present in the board by refreshing the default tasks set.
 * @async
 */
async function ensureAllDefaultTasksAreInBoard() {
  await deleteExistingDefaultTasksInTasksInFirebase();
  await getDefaultTasksFromFirebase();
  await postDefaultTasksIntoTasksInFirebase();
}
