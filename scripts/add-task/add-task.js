// const BASE_URL =
//   "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * add-task.js
 * Handles initialization, custom dropdown behavior, priority selection, and category loading.
 */

/**
 * Initializes the add-task page by disabling past dates, setting default priority,
 * loading contacts and categories, and registering event handlers.
 * @async
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
async function initAddTask(id) {
  addTaskColumn = "to do";

  contactsOptions = [];
  assignedContacts = [];
  categoriesArr = [];
  subtasksArr = [];

  disablePastDates(id);
  renderPriority(id);

  await getContacts();
  await getUsers();
  filteredContacts = contactsOptions;
  renderContactOptions(id);

  await getCategories();
  selectedCategory = "Select task category";
  renderSelectedCategory(id);
  renderCategories(id);

  registerEnterHandlers(id);
  addEventListeners(id);

  enableAllPointerEvents(id);
}

/**
 * Closes a custom select dropdown by hiding options and resetting the arrow icon.
 * @param {string} selectName - The name of the select dropdown to close (e.g., "contacts", "category")
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function closeCustomSelectDropdown(selectName, id) {
  let options = document.getElementById(
    "select-options" + "--" + selectName + id,
  );
  let arrow = document.getElementById(
    "arrow-dropdown" + "--" + selectName + id,
  );

  options.classList.add("display-none");
  options.setAttribute("inert", "");
  arrow.classList.remove("rotate");
}

/**
 * Toggles the visibility of a custom select dropdown, rendering fresh options if needed.
 * @async
 * @param {string} selectName - The name of the select dropdown to toggle (e.g., "contacts", "category")
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
async function toggleCustomSelectDropdown(selectName, id) {
  let options = document.getElementById(
    "select-options" + "--" + selectName + id,
  );

  if (selectName === "contacts" && options.classList.contains("display-none")) {
    renderContactOptions(id);
  } else if (selectName === "category") {
    handleCategories(options, id);
  }

  handleOptions(selectName, id);
  handleArrow(selectName, id);
}

/**
 * Toggles the display-none class on the options container and manages the inert attribute.
 * @param {string} selectName - The name of the select dropdown
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function handleOptions(selectName, id) {
  let options = document.getElementById(
    "select-options" + "--" + selectName + id,
  );

  options.classList.toggle("display-none");
  if (options.classList.contains("display-none")) {
    options.setAttribute("inert", "");
  } else {
    options.removeAttribute("inert");
  }
}

/**
 * Toggles the rotate class on the dropdown arrow icon.
 * @param {string} selectName - The name of the select dropdown
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function handleArrow(selectName, id) {
  let arrow = document.getElementById(
    "arrow-dropdown" + "--" + selectName + id,
  );
  arrow.classList.toggle("rotate");
}

/**
 * Resets the category selection to the default state.
 * @param {HTMLElement} options - The options container element
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function handleCategories(options, id) {
  selectedCategory = "Select task category";
  renderSelectedCategory(id);
}

/**
 * Stops event propagation if the contacts dropdown is open.
 * @param {Event} event - The click event
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function handleStopPropagation(event, id) {
  let options = document.getElementById(
    "select-options" + "--" + "contacts" + id,
  );

  if (!options.classList.contains("display-none")) {
    event.stopPropagation();
  }
}

/**
 * Opens the native date picker for the task due date input.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function showDatePicker(id) {
  let dateInput = document.getElementById("task-due-date" + id);
  dateInput.showPicker();
}

/**
 * Sets the minimum date on the date input to today, preventing selection of past dates.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function disablePastDates(id) {
  document.getElementById("task-due-date" + id).min = new Date()
    .toISOString()
    .split("T")[0];
}

// #region priority
let priority = "Medium";

/**
 * Sets the task priority and updates the UI representation.
 * @param {string} prio - The priority level ("Urgent", "Medium", "Low")
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function setPriority(prio, id) {
  priority = prio;
  renderPriority(id);
}

/**
 * Updates the priority button and SVG colors to reflect the current priority.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function renderPriority(id) {
  stylePrioBtnsColor(id);
  stylePrioSvgColors(id);
}

/**
 * Applies active styling to the current priority button and removes it from the others.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function stylePrioBtnsColor(id) {
  let activeBtn = document.getElementById(
    priority.toLowerCase() + "-prio-btn" + id,
  );

  document.querySelectorAll(".prio-btn").forEach((btn) => {
    if (btn !== activeBtn) {
      btn.classList.remove("urgent-active", "medium-active", "low-active");
    }
  });
  activeBtn.classList.add(priority.toLowerCase() + "-active");
}

/**
 * Applies active styling to the current priority SVG and removes it from the others.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function stylePrioSvgColors(id) {
  let activeSvg = document.getElementById(
    priority.toLowerCase() + "-prio-svg" + id,
  );

  document.querySelectorAll(".prio-svg").forEach((svg) => {
    if (svg !== activeSvg) {
      svg.querySelectorAll("path").forEach((path) => {
        path.classList.remove("active-svg");
      });
    }
  });

  activeSvg.querySelectorAll("path").forEach((path) => {
    path.classList.add("active-svg");
  });
}

// #endregion

// #region categories

let categoriesArr = [];
let selectedCategory = "Select task category";

/**
 * Fetches all task categories from Firebase.
 * @async
 */
async function getCategories() {
  let response = await fetch(BASE_URL + "categories" + ".json");
  let categoriesObj = await response.json();

  if (categoriesObj) {
    fillCategoriesArray(categoriesObj);
  }
}

/**
 * Populates the categoriesArr with category data from Firebase response.
 * @param {Object} categoriesObj - The categories object from Firebase
 */
function fillCategoriesArray(categoriesObj) {
  let keysArr = Object.keys(categoriesObj);

  for (let i = 0; i < keysArr.length; i++) {
    let id = keysArr[i];

    let categoryData = {
      id: id,
      title: categoriesObj[id].title,
    };

    categoriesArr.push(categoryData);
  }
}

/**
 * Renders all available categories in the category dropdown.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 */
function renderCategories(id) {
  const CATEGORIES_DIV = document.getElementById(
    "select-options--category" + id,
  );

  CATEGORIES_DIV.innerHTML = "";

  for (let index = 0; index < categoriesArr.length; index++) {
    CATEGORIES_DIV.innerHTML += categoryOptionTemplate(index, id);
  }
}

/**
 * Updates the selected category and re-renders the selection.
 * @param {string} category - The category title to select
 */
function selectCategory(category, id) {
  selectedCategory = category;
  renderSelectedCategory(id);
}

/**
 * Updates the display of the selected category and closes the dropdown if a valid selection is made.
 */
function renderSelectedCategory(id) {
  const SELECTED_CATEGORY = document.getElementById("selected-category" + id);
  SELECTED_CATEGORY.innerText = selectedCategory;
  const CATEGORIES_DROPDOWN = document.getElementById(
    "categories-dropdown" + id,
  );
  const TRIGGER = document.getElementById(
    "custom-select-trigger-category" + id,
  );
  let focused = CATEGORIES_DROPDOWN.querySelector(":focus");

  if (selectedCategory !== "Select task category") {
    closeCustomSelectDropdown("category", id);
    if (focused) {
      focused.blur();
    }
  }
}

// #endregion

// #region subtasks

let subtasksArr = [];
let skipFocusoutRender = false;

/**
 * Clears the subtask input field and refocuses it.
 */
function clearSubtaskInput(id) {
  const SUBTASK_INPUT_REF = document.getElementById("subtask-input" + id);
  SUBTASK_INPUT_REF.value = "";
  SUBTASK_INPUT_REF.focus();
}

/**
 * Adds a new subtask from the input field to the subtasks array and re-renders.
 */
function addSubtask(id) {
  const SUBTASK_INPUT = document.getElementById("subtask-input" + id).value;

  const subtaskObj = {
    title: SUBTASK_INPUT,
    done: false,
  };

  if (SUBTASK_INPUT.length > 0) {
    subtasksArr.push({ ...subtaskObj });
    renderSubtasks(id);
    clearSubtaskInput(id);
  }
}

/**
 * Renders all subtasks in the subtask list with edit and delete handlers.
 */
function renderSubtasks(id) {
  const SUBTASK_UL = document.getElementById("subtask-list" + id);
  const SUBTASK_INPUT_REF = document.getElementById("subtask-input" + id);

  SUBTASK_UL.innerHTML = "";

  for (let index = 0; index < subtasksArr.length; index++) {
    SUBTASK_UL.innerHTML += subtaskLiTemplate(subtasksArr[index], index, id);

    registerEnterHandler("#subtask-li-" + index + id, () => {
      openSubtaskEdit(index, id);
    });
  }
}

/**
 * Re-renders a single subtask after editing.
 * @param {number} indexSubtask - The index of the subtask to render
 */
function renderSingleSubtask(indexSubtask, id) {
  let li = document.getElementById("subtask-li-" + indexSubtask + id);
  li.outerHTML = subtaskLiTemplate(subtasksArr[indexSubtask], indexSubtask, id);

  registerEnterHandler("#subtask-li-" + indexSubtask + id, () => {
    openSubtaskEdit(indexSubtask, id);
  });
}

/**
 * Opens a subtask for editing by replacing it with an input field.
 * @param {number} indexSubtask - The index of the subtask to edit
 */
function openSubtaskEdit(indexSubtask, id) {
  const li = document.getElementById("subtask-li-" + indexSubtask + id);
  li.outerHTML = subtaskLiWithInputTemplate(indexSubtask, id);

  registerEnterHandler("#li-input" + indexSubtask + id, () => {
    submitEditedSubtask(indexSubtask, id);
  });

  addSubtaskEditEventListener(indexSubtask, id);
  focusSubtaskEditInput(indexSubtask, id);
}

/**
 * Submits the edited subtask, updating or deleting it as needed.
 * @param {number} indexSubtask - The index of the subtask being edited
 */
function submitEditedSubtask(indexSubtask, id) {
  let edit = document.getElementById("li-input" + indexSubtask + id).value;

  if (edit.length > 0) {
    subtasksArr.splice(indexSubtask, 1, { title: edit, done: false });
    skipFocusoutRender = true;
    renderSingleSubtask(indexSubtask, id);
    skipFocusoutRender = false;
  } else if (edit.length === 0) {
    deleteSubtask(indexSubtask, id);
  }
}

/**
 * Deletes a subtask from the array and re-renders the list.
 * @param {number} indexSubtask - The index of the subtask to delete
 */
function deleteSubtask(indexSubtask, id) {
  subtasksArr.splice(indexSubtask, 1);
  renderSubtasks(id);
}

/**
 * Adds a focusout event listener to a subtask edit element.
 * @param {number} indexSubtask - The index of the subtask
 */
function addSubtaskEditEventListener(indexSubtask, id) {
  let li = document.getElementById("subtask-li-" + indexSubtask + id);

  li.addEventListener("focusout", (event) => {
    if (li.contains(event.relatedTarget)) return;
    if (skipFocusoutRender) return;
    renderSingleSubtask(indexSubtask, id);
  });
}

/**
 * Focuses the subtask edit input and places the cursor at the end.
 * @param {number} indexSubtask - The index of the subtask
 */
function focusSubtaskEditInput(indexSubtask, id) {
  let input = document.getElementById("li-input" + indexSubtask + id);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

// #endregion
