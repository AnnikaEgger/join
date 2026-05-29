/**
 * Adds a new task to the specified column after validating form and category selection.
 * Shows a toast message and redirects to board on success.
 * @async
 * @param {string} column - The target column for the task ("to do", "in progress", "await feedback", "done")
 */
async function addTask(column) {
  const FORM = document.getElementById("task-form");

  if (FORM.checkValidity() && selectedCategory !== "Select task category") {
    //  prevent default submit (page reload)
    event.preventDefault();

    let task = taskJson(column);
    await postTaskToFirebase(task);

    showAddtaskToastMsg();
    setTimeout(function () {
      window.location.href = "../html/board.html";
      clearTask();
    }, 3000);
  }
}

/**
 * Creates a JSON object containing all task data from form inputs.
 * @param {string} column - The target column for the task
 * @returns {Object} Task object with title, description, due_date, priority, assigned_contacts, category, subtasks, and column
 */
function taskJson(column) {
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
    column: column,
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
    input.closest(".required").classList.remove("input-with-after");
  } else {
    input.classList.add("invalid");
    input.closest(".required").classList.add("input-with-after");
  }
}

/**
 * Validates the due date input and applies or removes the invalid styling.
 * @param {HTMLInputElement} input - The due date input element
 */
function dueDateFormValidation(input) {
  if (input.checkValidity()) {
    input
      .closest(".required")
      .classList.remove("custom-select-with-after", "invalid");
  } else {
    input
      .closest(".required")
      .classList.add("custom-select-with-after", "invalid");
  }
}
