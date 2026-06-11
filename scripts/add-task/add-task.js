let priority = "Medium";
let categoriesArr = [];
let selectedCategory = "Select task category";

/**
 * Initializes the add-task page by disabling past dates, setting default priority,
 * loading contacts and categories, and registering event handlers.
 * @async
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {Promise<void>} Resolves when initialization is complete.
 */
async function initAddTask(id) {
  guardPage();
  resetTaskValues();
  disablePastDates(id);
  renderPriority(id);
  await initContacts(id);
  await initCategories(id);
  registerEnterHandlers(id);
  addEventListeners(id);
  enableAllPointerEvents(id);
}

/**
 * Resets all task-related UI state to its initial defaults for a fresh form.
 * @returns {void}
 */
function resetTaskValues() {
  addTaskColumn = "to do";
  contactsOptions = [];
  assignedContacts = [];
  categoriesArr = [];
  subtasksArr = [];
}

/**
 * Loads contacts, filters them, and renders the contact options for the current form.
 * @async
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @returns {Promise<void>} Resolves after the contacts have been loaded and rendered.
 */
async function initContacts(id) {
  await getContacts();
  await getUsers();
  filteredContacts = contactsOptions;
  renderContactOptions(id);
}

/**
 * Loads available categories and renders the default selection and dropdown options.
 * @async
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @returns {Promise<void>} Resolves after categories are fetched and rendered.
 */
async function initCategories(id) {
  await getCategories();
  selectedCategory = "Select task category";
  renderSelectedCategory(id);
  renderCategories(id);
}

/**
 * Closes a custom select dropdown by hiding options and resetting the arrow icon.
 * @param {string} selectName - The name of the select dropdown to close (e.g., "contacts", "category")
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
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
 * @returns {Promise<void>} Resolves when the dropdown state has been handled.
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
 * @returns {void}
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
 * @returns {void}
 */
function handleArrow(selectName, id) {
  let arrow = document.getElementById(
    "arrow-dropdown" + "--" + selectName + id,
  );
  arrow.classList.toggle("rotate");
}

/**
 * Resets the category selection to the default state.
 * @param {HTMLElement} options - The options container element.
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @returns {void}
 */
function handleCategories(options, id) {
  selectedCategory = "Select task category";
  renderSelectedCategory(id);
}

/**
 * Stops event propagation if the contacts dropdown is open.
 * @param {Event} event - The click event
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
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
 * @returns {void}
 */
function showDatePicker(id) {
  let dateInput = document.getElementById("task-due-date" + id);
  dateInput.showPicker();
}

/**
 * Sets the minimum date on the date input to today, preventing selection of past dates.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function disablePastDates(id) {
  document.getElementById("task-due-date" + id).min = new Date()
    .toISOString()
    .split("T")[0];
}

/**
 * Sets the task priority and updates the UI representation.
 * @param {string} prio - The priority level ("Urgent", "Medium", "Low")
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function setPriority(prio, id) {
  priority = prio;
  renderPriority(id);
}

/**
 * Updates the priority button and SVG colors to reflect the current priority.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function renderPriority(id) {
  stylePrioBtnsColor(id);
  stylePrioSvgColors(id);
}

/**
 * Applies active styling to the current priority button and removes it from the others.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
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
 * @returns {void}
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

/**
 * Fetches all task categories from Firebase.
 * @async
 * @returns {Promise<void>} Resolves when categories are loaded.
 */
async function getCategories() {
  categoriesArr = [];
  let response = await fetch(BASE_URL + "categories" + ".json");
  let categoriesObj = await response.json();
  if (categoriesObj) {
    fillCategoriesArray(categoriesObj);
  }
}

/**
 * Populates the categoriesArr with category data from Firebase response.
 * @param {Object} categoriesObj - The categories object from Firebase
 * @returns {void}
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
 * @returns {void}
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
 * Updates the selected category and re-renders the selection UI.
 * @param {string} category - The category title to select.
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @returns {void}
 */
function selectCategory(category, id) {
  selectedCategory = category;
  renderSelectedCategory(id);
  checkIfCategoryWasSelected(id);
}

/**
 * Updates the displayed selected category and closes the dropdown when a valid choice is made.
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @returns {void}
 */
function renderSelectedCategory(id) {
  const SELECTED_CATEGORY = document.getElementById("selected-category" + id);
  SELECTED_CATEGORY.innerText = selectedCategory;
  const CATEGORIES_DROPDOWN = document.getElementById(
    "categories-dropdown" + id,
  );
  let focused = CATEGORIES_DROPDOWN.querySelector(":focus");
  closeCategoriesDropdown(id, focused);
}

/**
 * Closes the category dropdown list and removes focus from the element if a category is selected.
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @param {HTMLElement|null} focused - The currently focused element within the dropdown context.
 * @returns {void}
 */
function closeCategoriesDropdown(id, focused) {
  if (selectedCategory !== "Select task category") {
    closeCustomSelectDropdown("category", id);
    if (focused) {
      focused.blur();
    }
  }
}