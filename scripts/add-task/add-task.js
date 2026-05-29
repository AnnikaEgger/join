const BASE_URL =
  "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Initializes the add-task page by disabling past dates, setting default priority,
 * loading contacts and categories, and registering event handlers.
 * @async
 */
async function init() {
  disablePastDates();
  renderPriority();

  await getContacts();
  filteredContacts = contactsOptions;
  renderContactOptions();

  await getCategories();
  selectedCategory = "Select task category";
  renderSelectedCategory();
  renderCategories();

  registerEnterHandlers();
  addEventListeners();
}

/**
 * Closes a custom select dropdown by hiding options and resetting the arrow icon.
 * @param {string} selectName - The name of the select dropdown to close (e.g., "contacts", "category")
 */
function closeCustomSelectDropdown(selectName) {
  let options = document.getElementById("select-options" + "--" + selectName);
  let arrow = document.getElementById("arrow-dropdown" + "--" + selectName);

  options.classList.add("display-none");
  options.setAttribute("inert", "");
  arrow.classList.remove("rotate");
}

/**
 * Toggles the visibility of a custom select dropdown, rendering fresh options if needed.
 * @async
 * @param {string} selectName - The name of the select dropdown to toggle (e.g., "contacts", "category")
 */
async function toggleCustomSelectDropdown(selectName) {
  let options = document.getElementById("select-options" + "--" + selectName);

  if (selectName === "contacts" && options.classList.contains("display-none")) {
    renderContactOptions();
  } else if (selectName === "category") {
    handleCategories(options);
  }

  handleOptions(selectName);
  handleArrow(selectName);
}

/**
 * Toggles the display-none class on the options container and manages inert attribute.
 * @param {string} selectName - The name of the select dropdown
 */
function handleOptions(selectName) {
  let options = document.getElementById("select-options" + "--" + selectName);

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
 */
function handleArrow(selectName) {
  let arrow = document.getElementById("arrow-dropdown" + "--" + selectName);
  arrow.classList.toggle("rotate");
}

/**
 * Resets the category selection to the default state.
 * @param {HTMLElement} options - The options container element
 */
function handleCategories(options) {
  selectedCategory = "Select task category";
  renderSelectedCategory();
}

/**
 * Stops event propagation if the contacts dropdown is open.
 * @param {Event} event - The click event
 */
function handleStopPropagation(event) {
  let options = document.getElementById("select-options" + "--" + "contacts");

  if (!options.classList.contains("display-none")) {
    event.stopPropagation();
  }
}

/**
 * Opens the native date picker for the task due date input.
 */
function showDatePicker() {
  let dateInput = document.getElementById("task-due-date");
  dateInput.showPicker();
}

/**
 * Sets the minimum date on the date input to today, preventing selection of past dates.
 */
function disablePastDates() {
  document.getElementById("task-due-date").min = new Date()
    .toISOString()
    .split("T")[0];
}

// #region priority
let priority = "Medium";

/**
 * Sets the task priority and updates the visual representation.
 * @param {string} prio - The priority level ("Urgent", "Medium", "Low")
 */
function setPriority(prio) {
  priority = prio;
  renderPriority();
}

/**
 * Updates the priority button and SVG colors to reflect the current priority.
 */
function renderPriority() {
  stylePrioBtnsColor();
  stylePrioSvgColors();
}

/**
 * Applies active styling to the current priority button and removes it from others.
 */
function stylePrioBtnsColor() {
  let activeBtn = document.getElementById(priority + "-prio-btn");

  document.querySelectorAll(".prio-btn").forEach((btn) => {
    if (btn !== activeBtn) {
      btn.classList.remove("urgent-active", "medium-active", "low-active");
    }
  });
  activeBtn.classList.add(priority + "-active");
}

/**
 * Applies active styling to the current priority SVG and removes it from others.
 */
function stylePrioSvgColors() {
  let activeSvg = document.getElementById(priority + "-prio-svg");

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
 */
function renderCategories() {
  const CATEGORIES_DIV = document.getElementById("select-options--category");

  CATEGORIES_DIV.innerHTML = "";

  for (let index = 0; index < categoriesArr.length; index++) {
    CATEGORIES_DIV.innerHTML += categoryOptionTemplate(index);
  }
}

/**
 * Updates the selected category and re-renders the selection.
 * @param {string} category - The category title to select
 */
function selectCategory(category) {
  selectedCategory = category;
  renderSelectedCategory();
}

/**
 * Updates the display of the selected category and closes the dropdown if a valid selection is made.
 */
function renderSelectedCategory() {
  const SELECTED_CATEGORY = document.getElementById("selected-category");
  SELECTED_CATEGORY.innerText = selectedCategory;
  const CATEGORIES_DROPDOWN = document.getElementById("categories-dropdown");
  const TRIGGER = document.getElementById("custom-select-trigger-category");
  let focused = CATEGORIES_DROPDOWN.querySelector(":focus");

  if (selectedCategory !== "Select task category") {
    closeCustomSelectDropdown("category");
    focused.blur();
  }
}

// #endregion

// #region subtasks

let subtasksArr = [];
let skipFocusoutRender = false;

/**
 * Clears the subtask input field and refocuses it.
 */
function clearSubtaskInput() {
  const SUBTASK_INPUT_REF = document.getElementById("subtask-input");
  SUBTASK_INPUT_REF.value = "";
  SUBTASK_INPUT_REF.focus();
}

/**
 * Adds a new subtask from the input field to the subtasks array and re-renders.
 */
function addSubtask() {
  const SUBTASK_INPUT = document.getElementById("subtask-input").value;

  if (SUBTASK_INPUT.length > 0) {
    subtasksArr.push(SUBTASK_INPUT);
    renderSubtasks();
  }
}

/**
 * Renders all subtasks in the subtask list with edit and delete handlers.
 */
function renderSubtasks() {
  const SUBTASK_UL = document.getElementById("subtask-list");
  const SUBTASK_INPUT_REF = document.getElementById("subtask-input");

  SUBTASK_UL.innerHTML = "";

  for (let index = 0; index < subtasksArr.length; index++) {
    SUBTASK_UL.innerHTML += subtaskLiTemplate(subtasksArr[index], index);

    registerEnterHandler("#subtask-li-" + index, () => {
      openSubtaskEdit(index);
    });
  }

  SUBTASK_INPUT_REF.value = "";
}

/**
 * Re-renders a single subtask after editing.
 * @param {number} indexSubtask - The index of the subtask to render
 */
function renderSingleSubtask(indexSubtask) {
  let li = document.getElementById("subtask-li-" + indexSubtask);
  li.outerHTML = subtaskLiTemplate(subtasksArr[indexSubtask], indexSubtask);

  registerEnterHandler("#subtask-li-" + indexSubtask, () => {
    openSubtaskEdit(indexSubtask);
  });
}

/**
 * Opens a subtask for editing by replacing it with an input field.
 * @param {number} indexSubtask - The index of the subtask to edit
 */
function openSubtaskEdit(indexSubtask) {
  const li = document.getElementById("subtask-li-" + indexSubtask);
  li.outerHTML = subtaskLiWithInputTemplate(indexSubtask);

  registerEnterHandler("#li-input" + indexSubtask, () => {
    submitEditedSubtask(indexSubtask);
  });

  addSubtaskEditEventListener(indexSubtask);
  focusSubtaskEditInput(indexSubtask);
}

/**
 * Submits the edited subtask, updating or deleting it as needed.
 * @param {number} indexSubtask - The index of the subtask being edited
 */
function submitEditedSubtask(indexSubtask) {
  let edit = document.getElementById("li-input" + indexSubtask).value;

  if (edit.length > 0) {
    subtasksArr.splice(indexSubtask, 1, edit);
    skipFocusoutRender = true;
    renderSingleSubtask(indexSubtask);
    skipFocusoutRender = false;
  } else if (edit.length === 0) {
    deleteSubtask(indexSubtask);
  }
}

/**
 * Deletes a subtask from the array and re-renders the list.
 * @param {number} indexSubtask - The index of the subtask to delete
 */
function deleteSubtask(indexSubtask) {
  subtasksArr.splice(indexSubtask, 1);
  renderSubtasks();
}

/**
 * Adds a focusout event listener to a subtask edit element.
 * @param {number} indexSubtask - The index of the subtask
 */
function addSubtaskEditEventListener(indexSubtask) {
  let li = document.getElementById("subtask-li-" + indexSubtask);

  li.addEventListener("focusout", (event) => {
    if (li.contains(event.relatedTarget)) return;
    if (skipFocusoutRender) return;
    renderSingleSubtask(indexSubtask);
  });
}

/**
 * Focuses the subtask edit input and places the cursor at the end.
 * @param {number} indexSubtask - The index of the subtask
 */
function focusSubtaskEditInput(indexSubtask) {
  let input = document.getElementById("li-input" + indexSubtask);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

// #endregion
