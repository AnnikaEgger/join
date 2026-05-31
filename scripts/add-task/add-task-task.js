/**
 * Adds a new task to the specified column after validating the form and category selection.
 * If validation passes, the task is posted to Firebase, a toast is shown, the form is cleared,
 * and task creation is completed for the current page.
 * @async
 * @param {Event} event - The submit event triggered by the form.
 * @param {string} column - The target column for the task ("to do", "in progress", "await feedback", "done").
 * @param {string} page - The originating page context ("add task" or "board").
 * @returns {Promise<void>} Resolves once the task has been posted and UI actions have been triggered.
 */

let addTaskColumn;

async function addTask(event, page) {
  const FORM = document.getElementById("task-form");

  console.log(addTaskColumn);

  if (FORM.checkValidity() && selectedCategory !== "Select task category") {
    //  prevent default submit (page reload)
    event.preventDefault();

    let task = taskJson();
    await postTaskToFirebase(task);

    showAddtaskToastMsg();
    clearTask();
    completeTaskCreation(page);
  }
}

/**
 * Completes the task creation flow after a brief delay.
 * Redirects to the board page when creating a task from the add-task page,
 * or closes the add-task dialog when running from the board.
 * @param {string} page - The originating page context ("add task" or "board").
 */
function completeTaskCreation(page) {
  setTimeout(() => {
    if (page === "add task") {
      redirectToBoard();
    } else if (page === "board") {
      closeAddTaskDialog();
      reloadBoard();
    }
  }, 3000);
}

function reloadBoard() {
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

function redirectToBoard() {
  setTimeout(() => {
    window.location.href = "../html/board.html";
  }, 250);
}

/**
 * Creates a JSON object containing all task data from form inputs.
 * @param {string} column - The target column for the task
 * @returns {Object} Task object with title, description, due_date, priority, assigned_contacts, category, subtasks, and column
 */
function taskJson() {
  const TITLE = document.getElementById("task-title").value;
  const DESCRIPTION = document.getElementById("task-description").value;
  const DUE_DATE = document.getElementById("task-due-date").value;

  return {
    title: TITLE,
    description: DESCRIPTION,
    due_date: DUE_DATE,
    priority: priority,
    assigned_contacts: assignedContacts,
    category: selectedCategory,
    subtasks: subtasksArr,
    column: addTaskColumn,
  };
}

/**
 * Displays a toast notification message for task creation and hides it after 3 seconds.
 */
function showAddtaskToastMsg() {
  const TOAST_MSG = document.getElementById("addtask-toast-msg");

  TOAST_MSG.classList.add("display-toast-msg");
  setTimeout(() => {
    TOAST_MSG.classList.remove("display-toast-msg");
  }, 3000);
}

/**
 * Sends the task object to Firebase as a POST request.
 * @async
 * @param {Object} task - The task object to post
 * @returns {Promise<Object>} The response from Firebase containing the new task ID
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
 */
function clearTask() {
  clearFormValues();
  renderAssignedContacts();
  renderSubtasks();
  renderSelectedCategory();
  renderPriority();
}

/**
 * Clears all form field values and resets priority to default.
 */
function clearFormValues() {
  const TITLE = document.getElementById("task-title");
  const DESCRIPTION = document.getElementById("task-description");
  const DUE_DATE = document.getElementById("task-due-date");

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
 */
function checkInputValidity(inputType) {
  const input = document.getElementById("task-" + inputType);

  if (inputType == "title") {
    titleFormValidation(input);
  }
  if (inputType == "due-date") {
    dueDateFormValidation(input);
  }
}

/**
 * Validates the title input and applies or removes the invalid styling.
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
 * Validates the due date input and applies or removes the invalid styling.
 * @param {HTMLInputElement} input - The due date input element
 */
function dueDateFormValidation(input) {
  if (input.checkValidity()) {
    input.closest(".required").classList.remove("after", "invalid");
  } else {
    input.closest(".required").classList.add("after", "invalid");
  }
}
