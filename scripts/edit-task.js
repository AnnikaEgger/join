// #region Annika - bitte hier keine Funktionen reinschreiben wegen Merge Conflict :)

/**
 * Opens the dialog for adding a new task.
 *
 * @param {parameter} - No parameters are required for this function as it simply opens a predefined dialog element in the HTML.
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
 *
 * @param {parameter} - No parameters are required for this function as it simply closes a predefined dialog element in the HTML.
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
 * Closes the add task dialog when clicking directly on the backdrop background.
 *
 * @param {*} - No parameters are required for this function as it directly interacts with the add task dialog element in the HTML to set up an event listener for clicks on the backdrop.
 */
const ADD_TASK_DIALOG = document.getElementById("addTaskDialog");
ADD_TASK_DIALOG.addEventListener("click", (event) => {
  if (event.target === ADD_TASK_DIALOG) {
    closeAddTaskDialog();
  }
});

/**
 * Deletes a task from Firebase and updates the UI.
 *
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
 *
 * @param {string} taskId - The ID of the task to delete from Firebase.
 * @returns {Object} The response from Firebase after attempting to delete the task.
 */
async function deleteTaskFromFirebase(taskId) {
  let response = await fetch(BASE_URL + "/tasks/" + taskId + ".json", {
    method: "DELETE",
  });

  return (responseToJson = await response.json());
}

/**
 * Initializes the edit task functionality.
 *
 * @param {string} id - The ID of the task to edit.
 */
async function initEditTask(id) {
  contactsOptions = [];
  categoriesArr = [];
  subtasksArr = [];
  assignedContacts = [];

  disablePastDates(id);

  await getContacts();
  await getUsers();
  filteredContacts = contactsOptions;
  renderContactOptions(id);

  await getCategories();
  renderSelectedCategory(id);
  renderCategories(id);

  registerEnterHandlers(id);
  addEventListeners(id);

  enableAllPointerEvents("taskDialog");
}

/**
 * Opens the edit mode for a specific task.
 *
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
 *
 * @param {string} taskId - The ID of the task to retrieve.
 * @returns {Object} The task data from Firebase.
 */
async function getTaskFromFirebase(taskId) {
  let response = await fetch(BASE_URL + "/tasks/" + taskId + ".json");

  return await response.json();
}

/**
 * Renders the subtasks for the edit mode.
 *
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
 *
 * @param {Object} task - The task object containing assigned contacts.
 */
function renderAssignedContactsEditMode(task) {
  if (task.assigned_contacts) {
    assignedContacts.push(...task.assigned_contacts);
    renderAssignedContacts("--edit-task");
  }
}

/**
 * Submits the edited task data to Firebase.
 *
 * @param {string} column - The column to which the task belongs.
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
 *
 * @param {string} column - The column to which the task belongs.
 * @param {string} taskId - The ID of the task to update.
 * @returns {Object} The response from Firebase after attempting to update the task.
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
 *
 * @param {string} column - The column to which the task belongs.
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

// const tasks = [
//   {
//     default_task: true,
//     title: "Implement JWT-based authentication for API",
//     description:
//       "Build a secure authentication system using JWT, including token generation, validation, and protected routes for backend services.",
//     due_date: "2026-06-12",
//     priority: "Urgent",
//     assigned_contacts: [
//       { id: "c2", color: "#FF5EB3", name: "Anja Schulz" },
//       { id: "c6", color: "#1FD7C1", name: "Emmanuel Mauer" },
//       { id: "c4", color: "#9327FF", name: "David Eisenberg" },
//     ],
//     category: "Technical Task",
//     subtasks: [
//       { title: "Define authentication flow and token strategy", done: false },
//       { title: "Implement JWT generation on login", done: false },
//       { title: "Add middleware for route protection", done: false },
//       { title: "Write API tests for auth endpoints", done: false },
//     ],
//     column: "to do",
//   },

//   {
//     default_task: true,
//     title: "Redesign analytics dashboard for improved usability",
//     description:
//       "Improve layout, usability, and responsiveness of the analytics dashboard with a focus on clearer data visualization and better UX structure.",
//     due_date: "2026-06-18",
//     priority: "Medium",
//     assigned_contacts: [
//       { id: "c5", color: "#FCBE2D", name: "Eva Fischer" },
//       { id: "c3", color: "#6E52FF", name: "Benedikt Ziegler" },
//       { id: "c10", color: "#1FD7C1", name: "Yvonne Müller" },
//       { id: "c8", color: "#FF4646", name: "Tatjana Wolf" },
//     ],
//     category: "User Story",
//     subtasks: [
//       { title: "Analyze current dashboard pain points", done: false },
//       { title: "Create updated UI wireframes", done: false },
//       { title: "Redesign layout for responsiveness", done: false },
//       { title: "Validate improvements with stakeholder feedback", done: false },
//     ],
//     column: "in progress",
//   },

//   {
//     default_task: true,
//     title: "Fix intermittent payment gateway transaction failures",
//     description:
//       "Investigate and resolve unstable transaction behavior in the checkout process affecting payment success rate.",
//     due_date: "2026-06-08",
//     priority: "Urgent",
//     assigned_contacts: [
//       { id: "c22", color: "#FCBE2D", name: "Anton Meyer" },
//       { id: "c7", color: "#462F8A", name: "Marcel Bauer" },
//     ],
//     category: "Technical Task",
//     subtasks: [
//       { title: "Reproduce issue in staging environment", done: true },
//       { title: "Analyze payment service logs", done: true },
//       { title: "Implement and deploy hotfix", done: false },
//     ],
//     column: "await feedback",
//   },

//   {
//     default_task: true,
//     title: "Increase unit test coverage for user service",
//     description:
//       "Expand automated test coverage for user service including validation rules, edge cases, and error handling scenarios.",
//     due_date: "2026-06-05",
//     priority: "Low",
//     assigned_contacts: [{ id: "c9", color: "#462F8A", name: "Norbert Kiess" }],
//     category: "Technical Task",
//     subtasks: [
//       { title: "Set up and configure test framework", done: true },
//       { title: "Write core unit tests for user creation", done: true },
//       { title: "Add edge case coverage", done: false },
//     ],
//     column: "done",
//   },

//   {
//     default_task: true,
//     title: "Optimize CI/CD pipeline performance and reliability",
//     description:
//       "Improve build speed and deployment efficiency by optimizing pipeline steps and introducing caching mechanisms.",
//     due_date: "2026-06-20",
//     priority: "Medium",
//     assigned_contacts: [
//       { id: "c6", color: "#1FD7C1", name: "Emmanuel Mauer" },
//       { id: "c4", color: "#9327FF", name: "David Eisenberg" },
//       { id: "c10", color: "#1FD7C1", name: "Yvonne Müller" },
//     ],
//     category: "Technical Task",
//     subtasks: [
//       { title: "Identify pipeline bottlenecks", done: false },
//       { title: "Optimize build steps", done: false },
//       { title: "Introduce dependency caching", done: false },
//       { title: "Measure performance improvements", done: false },
//     ],
//     column: "to do",
//   },
// ];

let defaultTasks = [];

async function getDefaultTasksFromFirebase() {
  defaultTasks = [];

  let response = await fetch(BASE_URL + "default_tasks" + ".json");
  let responseToJson = await response.json();
  defaultTasks.push(...responseToJson);
}

async function postDefaultTasksIntoTasksInFirebase() {
  for (let index = 0; index < defaultTasks.length; index++) {
    let response = await fetch(BASE_URL + "tasks" + ".json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultTasks[index]),
    });
  }
}

async function deleteExistingDefaultTasksInTasksInFirebase() {
  let response = await fetch(BASE_URL + "tasks" + ".json");
  let responseToJson = await response.json();

  Object.entries(responseToJson).forEach(async ([id, task]) => {
    if (task.default_task === true) {
      await deleteTaskFromFirebase(id);
    }
  });
}

async function ensureAllDefaultTasksAreInBoard() {
  await deleteExistingDefaultTasksInTasksInFirebase();
  await getDefaultTasksFromFirebase();
  await postDefaultTasksIntoTasksInFirebase();
}

// #endregion
