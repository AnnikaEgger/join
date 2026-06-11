/**
 * Opens the native modal dialog for adding a new task and initializes the blank form state.
 *
 * @param {string} column - Target lane tracker classification key where the newly created card will drop.
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
 * Closes the add task modal interface layout overlay using an animation transition delay.
 *
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
 * Global background backdrop listener attachment layout.
 * Automatically triggers closing routines if a click lands outside the active form boundaries.
 */
const ADD_TASK_DIALOG = document.getElementById("addTaskDialog");
ADD_TASK_DIALOG.addEventListener("click", (event) => {
  if (event.target === ADD_TASK_DIALOG) {
    closeAddTaskDialog();
  }
});

/**
 * Deletes a task from Firebase, re-fetches active caches, and teardowns modal dialog states.
 * Locks active interactive keys to guarantee no conflict double calls pass during network latency.
 * * @async
 * @param {string} taskId - Target database index identification reference key code.
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
 * Dispatches an explicit native HTTP DELETE request toward the targeted Firebase endpoint path.
 * * @async
 * @param {string} taskId - Target reference key mapping database row pointer coordinates.
 * @returns {Promise<Object>} Formatted server action completion receipt data logs.
 */
async function deleteTaskFromFirebase(taskId) {
  let response = await fetch(BASE_URL + "/tasks/" + taskId + ".json", {
    method: "DELETE",
  });

  return await response.json();
}

/**
 * Flushes previous tracking lists and instantiates clean listeners/rules for the edit overlay layout viewport.
 * * @async
 * @param {string} id - Component grouping identification token used to generate scoped queries.
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
 * Synchronizes dependencies mapping lists data and renders available user tracking selection dropdown options.
 * * @async
 * @param {string} id - Form component matching suffix identification parameter.
 * @returns {Promise<void>}
 */
async function initContacts(id) {
  await getContacts();
  await getUsers();
  filteredContacts = contactsOptions;
  renderContactOptions(id);
}

/**
 * Activates editing visualization view inside the card detail overlay template.
 * Unpacks the matching active database item record to prepopulate input layout fields.
 * * @async
 * @param {string} taskId - Target element locating identification unique reference tracking keys.
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
 * Fetches one isolated singular task record from Firebase.
 * * @async
 * @param {string} taskId - String locating explicit structural target dictionary rows.
 * @returns {Promise<Object>} Evaluated server payload snapshot.
 */
async function getTaskFromFirebase(taskId) {
  let response = await fetch(BASE_URL + "/tasks/" + taskId + ".json");
  return await response.json();
}

/**
 * Populates local checklist cache parameters using data extracted from the loaded task profile.
 *
 * @param {Object} task - Target configuration entry blueprint model reference tracking point.
 * @param {Array<Object>} [task.subtasks] - Nested collection list tracking mini-task components.
 * @returns {void}
 */
function renderEditModeSubtasks(task) {
  if (task.subtasks) {
    subtasksArr.push(...task.subtasks);
    renderSubtasks("--edit-task");
  }
}

/**
 * Extracts and maps assigned team member identities into local buffer caches before execution.
 *
 * @param {Object} task - Targeted source dictionary entity element tracker.
 * @param {Array<Object>} [task.assigned_contacts] - Embedded contact objects dataset mapping references.
 * @returns {void}
 */
function renderAssignedContactsEditMode(task) {
  if (task.assigned_contacts) {
    assignedContacts.push(...task.assigned_contacts);
    renderAssignedContacts("--edit-task");
  }
}

/**
 * Handles validation and orchestrates the updates flow upon edit form intercept confirmation triggers.
 * * @async
 * @param {SubmitEvent} event - Intercepted interface form compliance routing notification payload.
 * @param {string} column - Operational lane tracking assignment value name.
 * @param {boolean} defaultTask - Standard core preset fallback marker configuration indicator flag.
 * @param {string} taskId - Database identifier string referencing records localization indices.
 * @param {string} templateId - Design system archetype core reference origin key indices.
 * @returns {Promise<void>}
 */
async function submitEditedTask(
  event,
  column,
  defaultTask,
  taskId,
  templateId,
) {
  event.preventDefault();
  await handleEditSubmission(column, defaultTask, taskId, templateId);
}

/**
 * Validates the edited task form and submits the update when all fields are valid.
 *
 * @param {string} column - The board column that contains the task.
 * @param {boolean} defaultTask - Indicates whether the task is a default task.
 * @param {string} taskId - The task identifier used for the update request.
 * @param {string} templateId - The template identifier associated with the task.
 * @returns {Promise<void>}
 */
async function handleEditSubmission(column, defaultTask, taskId, templateId) {
  const TASK_FORM = document.getElementById("task-form--edit-task");
  const DATE_INPUT = document.getElementById("task-due-date--edit-task");

  DATE_INPUT.disabled = true;
  const validForm = TASK_FORM.checkValidity();
  DATE_INPUT.disabled = false;
  const validDate = DATE_INPUT.value !== "";

  if (validForm && validDate) {
    disableButtonWhileLoading("task-edit-ok-btn");
    await putEditedTaskToFirebase(column, defaultTask, taskId, templateId);
    await loadTasks();
    openTaskDialog(taskId);
  }
}

/**
 * Uploads updated modifications using standard HTTP PUT parameters network requests.
 * * @async
 * @param {string} column - Board lane section tracking group coordinates category.
 * @param {boolean} defaultTask - Preset verification baseline index indicator criteria.
 * @param {string} taskId - Context identifier indicating absolute record storage slots.
 * @param {string} templateId - Layout categorization source structural context tracker.
 * @returns {Promise<void>}
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
 * Extracts active tracking field values from DOM inputs and builds a payload object.
 * * @async
 * @param {string} column - Targeted active swimlane string reference tag designation.
 * @param {boolean} defaultTask - Boolean state validation metadata flag.
 * @param {string} taskId - Active primary key tracking dictionary string pointer index.
 * @param {string} templateId - Identity context string indexing reference design source templates.
 * @returns {Promise<Object>} Completed updates profile mapping payload.
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

/**
 * Targets and requests explicit categorization type assignments properties from database endpoints.
 * * @async
 * @param {string} taskId - Target document unique database reference localization value key.
 * @returns {Promise<string>} Classification type metadata label assignment text value.
 */
async function getTaskEditCategory(taskId) {
  let response = await fetch(
    BASE_URL + "tasks/" + taskId + "/category" + ".json",
  );

  let responseToJson = await response.json();
  return responseToJson;
}
