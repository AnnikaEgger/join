/**
 * edit-task.js
 * Handles the edit task dialog, task update flow, and synchronization of default task templates.
 */

/**
 * Opens the dialog for adding a new task and initializes the add task state.
 * @param {string} column - The column where the new task should be created.
 * @returns {void}
 */
function openAddTaskDialog(column) {
  const ADD_TASK_DIALOG = document.getElementById("addTaskDialog");
  ADD_TASK_DIALOG.showModal();
  ADD_TASK_DIALOG.classList.add("show-dialog");

  initAddTask("--add-task-dialog");
  addTaskColumn = column;
}

/**
 * Closes the add task dialog and clears the form state.
 * @returns {void}
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
 * Deletes a task from Firebase, refreshes the board, and closes the dialog.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>}
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
 * Deletes a specific task entry from Firebase.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<Object>} The Firebase response payload.
 */
async function deleteTaskFromFirebase(taskId) {
  let response = await fetch(BASE_URL + "/tasks/" + taskId + ".json", {
    method: "DELETE",
  });

  return await response.json();
}

/**
 * Resets edit-mode state and initializes related dialog components.
 * @param {string} id - The dialog identifier suffix.
 * @returns {Promise<void>}
 */
async function initEditTask(id) {
  contactsOptions = [];
  subtasksArr = [];
  assignedContacts = [];

  disablePastDates(id);

  initContacts(id);

  registerEnterHandlers(id);
  addEventListeners(id);

  enableAllPointerEvents("taskDialog");
}

/**
 * Loads contacts and user data for the edit task dialog.
 * @param {string} id - The dialog identifier suffix.
 * @returns {Promise<void>}
 */
async function initContacts(id) {
  await getContacts();
  await getUsers();
  filteredContacts = contactsOptions;
  renderContactOptions(id);
}

/**
 * Opens the task edit dialog, populates fields, and initializes edit mode.
 * @param {string} taskId - The ID of the task to edit.
 * @returns {Promise<void>}
 */
async function openTaskEditMode(taskId) {
  disableButtonWhileLoading("edit-task-btn");
  disableButtonWhileLoading("delete-task-btn");

  const TASK_DIALOG = document.getElementById("taskDialog");

  let task = await getTaskFromFirebase(taskId);
  TASK_DIALOG.innerHTML = taskEditModeTemplate(task, taskId);
  addTaskFormEventListeners("--edit-task");

  setPriority(task.priority, "--edit-task");
  await initEditTask("--edit-task");
  renderAssignedContactsEditMode(task);
  renderEditModeSubtasks(task);
}

/**
 * Retrieves a task object from Firebase by its ID.
 * @param {string} taskId - The ID of the task to fetch.
 * @returns {Promise<Object>} The retrieved task object.
 */
async function getTaskFromFirebase(taskId) {
  let response = await fetch(BASE_URL + "/tasks/" + taskId + ".json");
  return await response.json();
}

/**
 * Renders subtasks into edit mode and updates local subtask state.
 * @param {Object} task - The task object with subtasks.
 * @returns {void}
 */
function renderEditModeSubtasks(task) {
  if (task.subtasks) {
    subtasksArr.push(...task.subtasks);
    renderSubtasks("--edit-task");
  }
}

/**
 * Renders assigned contacts for task edit mode from the current task.
 * @param {Object} task - The task object with assigned contacts.
 * @returns {void}
 */
function renderAssignedContactsEditMode(task) {
  if (task.assigned_contacts) {
    assignedContacts.push(...task.assigned_contacts);
    renderAssignedContacts("--edit-task");
  }
}

/**
 * Handles edit task form submission and sends changes to Firebase.
 * @param {Event} event - The submit event from the edit form.
 * @param {string} column - The column to which the task belongs.
 * @param {boolean} defaultTask - Whether the task is a default task.
 * @param {string} taskId - The ID of the task being edited.
 * @param {string} templateId - The template identifier for the task.
 * @returns {Promise<void>}
 */
async function submitEditedTask(
  event,
  column,
  defaultTask,
  taskId,
  templateId,
) {
  const TASK_FORM = document.getElementById("task-form--edit-task");
  event.preventDefault();

  if (TASK_FORM.checkValidity) {
    disableButtonWhileLoading("task-edit-ok-btn");
    await putEditedTaskToFirebase(column, defaultTask, taskId, templateId);
    await loadTasks();
    openTaskDialog(taskId);
  }
}

/**
 * Updates a task record in Firebase using PUT.
 * @param {string} column - The column to which the task belongs.
 * @param {boolean} defaultTask - Whether the task is a default task.
 * @param {string} taskId - The ID of the task being updated.
 * @param {string} templateId - The template identifier for the task.
 * @returns {Promise<Object>} The Firebase response payload.
 */
async function putEditedTaskToFirebase(
  column,
  defaultTask,
  taskId,
  templateId,
) {
  let task = await fetch(BASE_URL + "/tasks/" + taskId + ".json", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      await collectEditedTaskData(column, defaultTask, taskId, templateId),
    ),
  });
}

/**
 * Builds the edited task payload from the edit form values.
 * @param {string} column - The column to which the task belongs.
 * @param {boolean} defaultTask - Whether the task is a default task.
 * @param {string} taskId - The ID of the task being edited.
 * @param {string} templateId - The template identifier for the task.
 * @returns {Object} The task payload ready for Firebase.
 */
async function collectEditedTaskData(column, defaultTask, taskId, templateId) {
  const title = document.getElementById("task-title--edit-task").value;
  const description = document.getElementById(
    "task-description--edit-task",
  ).value;
  const dueDate = document.getElementById("task-due-date--edit-task").value;
  let taskCategory = await getTaskEditCategory(taskId);

  return {
    title: title,
    description: description,
    due_date: dueDate,
    priority: priority,
    assigned_contacts: assignedContacts,
    category: taskCategory,
    subtasks: subtasksArr,
    column: column,
    default_task: defaultTask,
    template_id: templateId,
  };
}

async function getTaskEditCategory(taskId) {
  let response = await fetch(
    BASE_URL + "tasks/" + taskId + "/category" + ".json",
  );

  let responseToJson = await response.json();
  return responseToJson;
}
