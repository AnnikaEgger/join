let addTaskColumn;

/**
 * Starts the task creation flow by disabling submit buttons, validating the form,
 * and re-enabling the relevant button after the request completes.
 * @async
 * @param {Event} event - The submit event triggered by the form.
 * @param {string} page - The originating page context ("add task" or "board").
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @returns {Promise<void>} Resolves after the task submit flow has finished.
 */
async function addTask(event, page, id) {
  if (id === "--add-task") {
    disableButtonWhileLoading("clear-task-btn" + id);
  } else if (id === "--add-task-dialog") {
    disableButtonWhileLoading("cancel-task-btn" + id);
  }
  disableButtonWhileLoading("create-task-btn" + id);
  await handleValidTaskSubmit(id, page, event);
  enableButton("create-task-btn" + id);
}

/**
 * Validates the submitted task data, posts it to Firebase, and completes the task flow.
 * @async
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @param {string} page - The originating page context ("add task" or "board").
 * @param {Event} event - The submit event object.
 * @returns {Promise<void>} Resolves after the task has been posted and the UI update flow starts.
 */
async function handleValidTaskSubmit(id, page, event) {
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
  enableAddTaskButtons(id);
}

/**
 * Enables the respective cancel or clear buttons based on the form context ID.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function enableAddTaskButtons(id) {
  if (id === "--add-task") {
    enableButton("clear-task-btn" + id);
  } else if (id === "--add-task-dialog") {
    enableButton("cancel-task-btn" + id);
  }
}

/**
 * Completes task creation by redirecting or refreshing the board after a short delay.
 * @param {string} page - The originating page context ("add task" or "board").
 * @returns {void}
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
 * @returns {void}
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
 * @returns {void}
 */
function showAddtaskToastMsg(id) {
  const TOAST_MSG = document.getElementById("addtask-toast-msg" + id);
  if (id === "--add-task") {
    TOAST_MSG.classList.add("display-toast-msg-add-task");
    setTimeout(() => {
      TOAST_MSG.classList.remove("display-toast-ms-add-task");
    }, 3000);
  } else if (id === "--add-task-dialog") {
    TOAST_MSG.classList.add("display-toast-msg-dialog");
    setTimeout(() => {
      TOAST_MSG.classList.remove("display-toast-msg-dialog");
    }, 3000);
  }
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
 * @returns {void}
 */
function clearTask(id) {
  clearFormValues(id);
  removeFormValidation(id);
  renderAssignedContacts(id);
  renderSubtasks(id);
  renderSelectedCategory(id);
  renderPriority(id);
}

/**
 * Clears all form field values and resets priority to default.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
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
 * Removes error-related css classes from all currently marked invalid form elements.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function removeFormValidation(id) {
  let invalidElements = [];
  document.querySelectorAll(".invalid").forEach((element) => {
    invalidElements.push(element);
  });
  document.querySelectorAll(".after").forEach((element) => {
    invalidElements.push(element);
  });
  invalidElements.forEach((element) => {
    element.classList.remove("invalid", "after");
  });
}

/**
 * Checks if a specific input type becomes valid and dynamically removes error styling.
 * @param {string} inputType - The type of input to check (e.g., "title" or "due-date")
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function checkIfInputValid(inputType, id) {
  const input = document.getElementById("task-" + inputType + id);
  if (input.checkValidity()) {
    if (inputType == "title") {
      input.classList.remove("invalid");
      input.closest(".required").classList.remove("after");
    } else if (inputType == "due-date") {
      input.closest(".required").classList.remove("after", "invalid");
    }
  }
}

/**
 * Checks if a specific input type is invalid and dynamically adds error styling.
 * @param {string} inputType - The type of input to check (e.g., "title" or "due-date")
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function checkIfInputInvalid(inputType, id) {
  const input = document.getElementById("task-" + inputType + id);
  if (!input.checkValidity()) {
    if (inputType == "title") {
      input.classList.add("invalid");
      input.closest(".required").classList.add("after");
    } else if (inputType == "due-date") {
      input.closest(".required").classList.add("after", "invalid");
    }
  }
}

/**
 * Validates whether a category was selected and updates the styling of the custom dropdown.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function checkIfCategoryWasSelected(id) {
  const categoriesDropdown = document.getElementById(
    "categories-dropdown" + id,
  );
  const categoriesTrigger = document.getElementById(
    "custom-select-trigger-category" + id,
  );
  if (selectedCategory === "Select task category") {
    categoriesDropdown.classList.add("after");
    categoriesTrigger.classList.add("invalid");
  } else {
    categoriesDropdown.classList.remove("after");
    categoriesTrigger.classList.remove("invalid");
  }
}