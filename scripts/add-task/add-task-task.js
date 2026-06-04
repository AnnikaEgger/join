/**
 * add-task-task.js
 * Handles task creation, form submission, validation, and task data preparation.
 */

let addTaskColumn;

/**
 * Adds a new task after validating the form and category selection.
 * @async
 * @param {Event} event - The submit event triggered by the form.
 * @param {string} page - The originating page context ("add task" or "board").
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {Promise<void>} Resolves once the task has been posted and UI actions are triggered.
 */
async function addTask(event, page, id) {
  if (id === "--add-task") {
    disableButtonWhileLoading("clear-task-btn" + id);
  } else if (id === "--add-task-dialog") {
    disableButtonWhileLoading("cancel-task-btn" + id);
  }

  disableButtonWhileLoading("create-task-btn" + id);

  const FORM = document.getElementById("task-form" + id);

  if (FORM.checkValidity() && selectedCategory !== "Select task category") {
    event.preventDefault();

    let task = taskJson(id);
    await postTaskToFirebase(task);

    if (id !== "--edit-task") {
      showAddtaskToastMsg(id);
    }
    clearTask(id);
    completeTaskCreation(page);
  }

  if (id === "--add-task") {
    enableButton("clear-task-btn" + id);
  } else if (id === "--add-task-dialog") {
    enableButton("cancel-task-btn" + id);
  }

  enableButton("create-task-btn" + id);
}

/**
 * Completes task creation by redirecting or refreshing the board after a short delay.
 * @param {string} page - The originating page context ("add task" or "board").
 */
function completeTaskCreation(page) {
  setTimeout(async () => {
    if (page === "add task") {
      redirectToBoard();
    } else if (page === "board") {
      await loadTasks();
      closeAddTaskDialog();
    }
  }, 3000);
}

/**
 * Redirects to the board page after a short delay.
 */
function redirectToBoard() {
  setTimeout(() => {
    window.location.href = "../html/board.html";
  }, 200);
}

/**
 * Creates a task object from the current form inputs.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {Object} The task object ready for Firebase submission.
 */
function taskJson(id) {
  const TITLE = document.getElementById("task-title" + id).value;
  const DESCRIPTION = document.getElementById("task-description" + id).value;
  const DUE_DATE = document.getElementById("task-due-date" + id).value;

  return {
    title: TITLE,
    description: DESCRIPTION,
    due_date: DUE_DATE,
    priority: priority,
    assigned_contacts: assignedContacts,
    category: selectedCategory,
    subtasks: getSubtasksJson(),
    column: addTaskColumn,
    default_task: false,
  };
}

/**
 * Builds the subtasks array for the task object.
 * @returns {Array<Object>} The subtasks JSON array
 */
function getSubtasksJson() {
  let subtasksJson = [];

  for (let index = 0; index < subtasksArr.length; index++) {
    subtasksJson.push({
      title: subtasksArr[index].title,
      done: false,
    });
  }
  return subtasksJson;
}

/**
 * Displays a toast notification message for task creation and hides it after 3 seconds.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function showAddtaskToastMsg(id) {
  const TOAST_MSG = document.getElementById("addtask-toast-msg" + id);

  TOAST_MSG.classList.add("display-toast-msg");
  setTimeout(() => {
    TOAST_MSG.classList.remove("display-toast-msg");
  }, 3000);
}

/**
 * Sends the task object to Firebase as a POST request.
 * @async
 * @param {Object} task - The task object to post
 * @returns {Promise<Object>} The Firebase response JSON
 */
async function postTaskToFirebase(task) {
  let response = await fetch(BASE_URL + "tasks.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  return await response.json();
}

/**
 * Clears all form inputs and resets task-related arrays to their initial state.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function clearTask(id) {
  clearFormValues(id);
  renderAssignedContacts(id);
  renderSubtasks(id);
  renderSelectedCategory(id);
  renderPriority(id);
}

/**
 * Clears all form field values and resets priority to default.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function clearFormValues(id) {
  const TITLE = document.getElementById("task-title" + id);
  const DESCRIPTION = document.getElementById("task-description" + id);
  const DUE_DATE = document.getElementById("task-due-date" + id);

  TITLE.value = "";
  DESCRIPTION.value = "";
  DESCRIPTION.style.height = "";
  DUE_DATE.value = "";
  priority = "medium";
  assignedContacts = [];
  selectedCategory = "Select task category";
  subtasksArr = [];
}

/**
 * Validates a form input field based on its type.
 * @param {string} inputType - The type of input to validate ("title" or "due-date")
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function checkInputValidity(inputType, id) {
  const input = document.getElementById("task-" + inputType + id);

  if (inputType == "title") {
    titleFormValidation(input);
  }
  if (inputType == "due-date") {
    dueDateFormValidation(input);
  }
}

/**
 * Validates the title input and applies or removes invalid styling.
 * @param {HTMLInputElement} input - The title input element
 */
function titleFormValidation(input) {
  if (input.checkValidity()) {
    input.classList.remove("invalid");
    input.closest(".required").classList.remove("after");
  } else {
    input.classList.add("invalid");
    input.closest(".required").classList.add("after");
  }
}

/**
 * Validates the due date input and applies or removes invalid styling.
 * @param {HTMLInputElement} input - The due date input element
 */
function dueDateFormValidation(input) {
  if (input.checkValidity()) {
    input.closest(".required").classList.remove("after", "invalid");
  } else {
    input.closest(".required").classList.add("after", "invalid");
  }
}
