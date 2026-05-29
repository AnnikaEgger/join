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

function showAddtaskToastMsg() {
  const TOAST_MSG = document.getElementById("addtask-toast-msg");

  TOAST_MSG.classList.add("display-toast-msg");
  setTimeout(() => {
    TOAST_MSG.classList.remove("display-toast-msg");
  }, 3000);
}

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

function clearTask() {
  clearFormValues();
  renderAssignedContacts();
  renderSubtasks();
  renderSelectedCategory();
  renderPriority();
}

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

function checkInputValidity(inputType) {
  const input = document.getElementById("task-" + inputType);

  if (inputType == "title") {
    titleFormValidation(input);
  }
  if (inputType == "due-date") {
    dueDateFormValidation(input);
  }
}

function titleFormValidation(input) {
  if (input.checkValidity()) {
    input.classList.remove("invalid");
    input.closest(".required").classList.remove("input-with-after");
  } else {
    input.classList.add("invalid");
    input.closest(".required").classList.add("input-with-after");
  }
}

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
