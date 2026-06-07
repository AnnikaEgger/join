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
 * Loads categories and renders the selected category for edit mode.
 * @param {string} id - The dialog identifier suffix.
 * @returns {Promise<void>}
 */
async function initCategories(id) {
  await getCategories();
  renderSelectedCategory(id);
  renderCategories(id);
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

  selectedCategory = task.category;
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

  if (
    TASK_FORM.checkValidity() &&
    selectedCategory !== "Select task category"
  ) {
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
      collectEditedTaskData(column, defaultTask, taskId, templateId),
    ),
  });
  return await task.json();
}

/**
 * Builds the edited task payload from the edit form values.
 * @param {string} column - The column to which the task belongs.
 * @param {boolean} defaultTask - Whether the task is a default task.
 * @param {string} taskId - The ID of the task being edited.
 * @param {string} templateId - The template identifier for the task.
 * @returns {Object} The task payload ready for Firebase.
 */
function collectEditedTaskData(column, defaultTask, taskId, templateId) {
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
    template_id: templateId,
  };
}

/**
 * Loads default task templates from Firebase.
 * @returns {Promise<Object>} The default task template data.
 */
async function getDefaultTasksTemplates() {
  let response = await fetch(BASE_URL + "default_tasks" + ".json");
  let responseToJson = await response.json();

  return responseToJson;
}

/**
 * Loads all tasks from Firebase and returns entries for default tasks.
 * @returns {Promise<Array<[string, Object]>>} An array of [taskId, task] pairs.
 */
async function getDefaultTasksFromBoard() {
  let response = await fetch(BASE_URL + "tasks" + ".json");
  let tasks = await response.json();

  const defaultTasksBoard = Object.entries(tasks).filter(
    ([taskId, task]) => task.default_task === true,
  );

  return defaultTasksBoard;
}

/**
 * Finds which default task templates are missing from the board.
 * @returns {Promise<void>}
 */
async function getMissingDefaultTasks() {
  const defaultTasksBoard = await getDefaultTasksFromBoard();

  const requiredIds = [
    "template1",
    "template2",
    "template3",
    "template4",
    "template5",
  ];

  const existingIds = defaultTasksBoard.map(
    ([taskId, task]) => task.template_id,
  );

  let missingDefaultTasksIds = requiredIds.filter(
    (requiredId) => !existingIds.includes(requiredId),
  );

  if (missingDefaultTasksIds.length > 0) {
    await postMissingDefaultTasks(missingDefaultTasksIds);
  }
}

/**
 * Posts missing default task templates as new tasks in Firebase.
 * @param {Array<string>} missingDefaultTasksIds - Template IDs to create.
 * @returns {Promise<void>}
 */
async function postMissingDefaultTasks(missingDefaultTasksIds) {
  let defaultTasksTemplates = await getDefaultTasksTemplates();

  for (const missingTemplateId of missingDefaultTasksIds) {
    const template = defaultTasksTemplates.find(
      (templateTask) => templateTask.template_id === missingTemplateId,
    );

    if (template) {
      await postTask(template);
    }
  }
}

/**
 * Creates a new task entry in Firebase.
 * @param {Object} task - The task payload to post.
 * @returns {Promise<void>}
 */
async function postTask(task) {
  await fetch(BASE_URL + "tasks" + ".json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

/**
 * Updates existing default tasks on the board to match current templates.
 * @returns {Promise<void>}
 */
async function patchExistingDefaultTasks() {
  const defaultTasksBoard = await getDefaultTasksFromBoard();
  const defaultTasksTemplates = await getDefaultTasksTemplates();

  for (const [taskId, task] of defaultTasksBoard) {
    const template = defaultTasksTemplates.find(
      (template) => template.template_id === task.template_id,
    );

    if (template) {
      await patchDefaultTask(taskId, template);
    }
  }
}

/**
 * Patches a default task with template data.
 * @param {string} taskId - The ID of the board task to patch.
 * @param {Object} template - The template used to update the task.
 * @returns {Promise<void>}
 */
async function patchDefaultTask(taskId, template) {
  await fetch(BASE_URL + `tasks/${taskId}.json`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: template.title,
      description: template.description,
      subtasks: template.subtasks,
      category: template.category,
    }),
  });

  let response = await fetch(BASE_URL + `tasks/${taskId}.json`);
  console.log(await response.json());
}

/**
 * Ensures default task templates are present and synchronized on the board.
 * @returns {Promise<void>}
 */
async function ensureAllDefaultTasksAreInBoard() {
  await getMissingDefaultTasks();
  await patchExistingDefaultTasks();
}
