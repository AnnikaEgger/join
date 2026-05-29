const BASE_URL =
  "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/";

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

function closeCustomSelectDropdown(selectName) {
  let options = document.getElementById("select-options" + "--" + selectName);
  let arrow = document.getElementById("arrow-dropdown" + "--" + selectName);

  options.classList.add("display-none");
  options.setAttribute("inert", "");
  arrow.classList.remove("rotate");
}

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

function handleOptions(selectName) {
  let options = document.getElementById("select-options" + "--" + selectName);

  options.classList.toggle("display-none");
  if (options.classList.contains("display-none")) {
    options.setAttribute("inert", "");
  } else {
    options.removeAttribute("inert");
  }
}

function handleArrow(selectName) {
  let arrow = document.getElementById("arrow-dropdown" + "--" + selectName);
  arrow.classList.toggle("rotate");
}

function handleCategories(options) {
  selectedCategory = "Select task category";
  renderSelectedCategory();
  // if (options.classList.contains("display-none")) {
  //   renderCategories();
  // }
}

function handleStopPropagation(event) {
  let options = document.getElementById("select-options" + "--" + "contacts");

  if (!options.classList.contains("display-none")) {
    event.stopPropagation();
  }
}

function showDatePicker() {
  let dateInput = document.getElementById("task-due-date");
  dateInput.showPicker();
}

function disablePastDates() {
  document.getElementById("task-due-date").min = new Date()
    .toISOString()
    .split("T")[0];
}

// #region priority
let priority = "medium";

function setPriority(prio) {
  priority = prio;
  renderPriority();
}

function renderPriority() {
  stylePrioBtnsColor();
  stylePrioSvgColors();
}

function stylePrioBtnsColor() {
  let activeBtn = document.getElementById(priority + "-prio-btn");

  document.querySelectorAll(".prio-btn").forEach((btn) => {
    if (btn !== activeBtn) {
      btn.classList.remove("urgent-active", "medium-active", "low-active");
    }
  });
  activeBtn.classList.add(priority + "-active");
}

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

async function getCategories() {
  let response = await fetch(BASE_URL + "categories" + ".json");
  let categoriesObj = await response.json();

  if (categoriesObj) {
    fillCategoriesArray(categoriesObj);
  }
}

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

function renderCategories() {
  const CATEGORIES_DIV = document.getElementById("select-options--category");

  CATEGORIES_DIV.innerHTML = "";

  for (let index = 0; index < categoriesArr.length; index++) {
    CATEGORIES_DIV.innerHTML += categoryOptionTemplate(index);
  }
}

function selectCategory(category) {
  selectedCategory = category;
  renderSelectedCategory();
}

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

function clearSubtaskInput() {
  const SUBTASK_INPUT_REF = document.getElementById("subtask-input");
  SUBTASK_INPUT_REF.value = "";
  SUBTASK_INPUT_REF.focus();
}

function addSubtask() {
  const SUBTASK_INPUT = document.getElementById("subtask-input").value;

  if (SUBTASK_INPUT.length > 0) {
    subtasksArr.push(SUBTASK_INPUT);
    renderSubtasks();
  }
}

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

function renderSingleSubtask(indexSubtask) {
  let li = document.getElementById("subtask-li-" + indexSubtask);
  li.outerHTML = subtaskLiTemplate(subtasksArr[indexSubtask], indexSubtask);

  registerEnterHandler("#subtask-li-" + indexSubtask, () => {
    openSubtaskEdit(indexSubtask);
  });
}

function openSubtaskEdit(indexSubtask) {
  const li = document.getElementById("subtask-li-" + indexSubtask);
  li.outerHTML = subtaskLiWithInputTemplate(indexSubtask);

  registerEnterHandler("#li-input" + indexSubtask, () => {
    submitEditedSubtask(indexSubtask);
  });

  addSubtaskEditEventListener(indexSubtask);
  focusSubtaskEditInput(indexSubtask);
}

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

function deleteSubtask(indexSubtask) {
  subtasksArr.splice(indexSubtask, 1);
  renderSubtasks();
}

function addSubtaskEditEventListener(indexSubtask) {
  let li = document.getElementById("subtask-li-" + indexSubtask);

  li.addEventListener("focusout", (event) => {
    if (li.contains(event.relatedTarget)) return;
    if (skipFocusoutRender) return;
    renderSingleSubtask(indexSubtask);
  });
}

function focusSubtaskEditInput(indexSubtask) {
  let input = document.getElementById("li-input" + indexSubtask);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

// #endregion
