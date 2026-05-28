const BASE_URL =
  "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/";
const enterHandlers = new Map();
let successfullSubmit;

// #region enter handlers
function registerEnterHandler(selector, handler) {
  enterHandlers.set(selector, handler);
}

function registerEnterHandlers() {
  registerEnterHandler("#custom-select-trigger-contacts", () => {
    toggleCustomSelectDropdown("contacts");
  });

  contactOptionsEnterHandlers();
  contactOptionsCheckboxesEnterHandlers();

  registerEnterHandler("#custom-select-trigger-category", () => {
    toggleCustomSelectDropdown("category");
  });
  categoryOptionsEnterHandlers();

  registerEnterHandler("#subtask-input", addSubtask);
}

function contactOptionsEnterHandlers() {
  let contactOptions = document.querySelectorAll(".contact-option");

  contactOptions.forEach((option) => {
    registerEnterHandler(
      "#contact-option-" + option.dataset.indexContact,
      () => {
        selectContact(
          option.dataset.indexContact,
          filteredContacts[option.dataset.indexContact].id,
          false,
        );
      },
    );
  });
}

// fix!
function contactOptionsCheckboxesEnterHandlers() {
  let contactOptionsCheckboxes = document.querySelectorAll(
    ".contact-option-checkbox",
  );
  contactOptionsCheckboxes.forEach((checkbox) => {
    registerEnterHandler("#checkbox" + checkbox.dataset.indexContact, () => {
      selectContact(
        checkbox.dataset.indexContact,
        filteredContacts[checkbox.dataset.indexContact].id,
        true,
      );
    });
  });
}

function categoryOptionsEnterHandlers() {
  let categoryOptions = document.querySelectorAll(".category-option");
  categoryOptions.forEach((option) => {
    registerEnterHandler(
      "#category-option-" + option.dataset.indexCategory,
      () => {
        selectCategory(categoriesArr[option.dataset.indexCategory].title);
      },
    );
  });
}

// #endregion

// #region event listeners
function addEventListeners() {
  const TASK_FORM = document.getElementById("task-form");
  const CONTACTS_DROPDOWN = document.getElementById("contacts-dropdown");
  const CATEGORIES_DROPDOWN = document.getElementById("categories-dropdown");

  TASK_FORM.addEventListener("keydown", taskFormKeydownFunction);
  TASK_FORM.addEventListener("submit", taskFormSubmitFunction);

  CONTACTS_DROPDOWN.addEventListener(
    "focusout",
    contactsDropdownFocusOutFunction,
  );

  CATEGORIES_DROPDOWN.addEventListener(
    "click",
    categoriesDropdownClickFunction,
  );
  CATEGORIES_DROPDOWN.addEventListener(
    "focusout",
    categoriesDropdownFocusOutFunction,
  );
}

function taskFormKeydownFunction() {
  if (event.key !== "Enter") return;

  const el = event.target;
  let continueFunction = handleKeyDownElement(el);
  if (!continueFunction) return;

  event.preventDefault();

  for (const [selector, handler] of enterHandlers) {
    if (el.matches(selector)) {
      handler();
      break;
    }
  }
}

function handleKeyDownElement(el) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.tagName === "BUTTON") return false;
  if (el.tagName === "TEXTAREA") return false;

  if (
    el.tagName === "INPUT" &&
    el.id !== "search-contact-input" &&
    el.id !== "subtask-input" &&
    !el.id.startsWith("li-input")
  ) {
    el.blur();
  }

  return true;
}

// go on here
function taskFormSubmitFunction() {
  const TASK_FORM = document.getElementById("task-form");
  const CATEGORIES_DROPDOWN = document.getElementById("categories-dropdown");
  const CATEGORY_TRIGGER = document.getElementById(
    "custom-select-trigger-category",
  );

  if (
    !TASK_FORM.checkValidity() ||
    selectedCategory == "Select task category"
  ) {
    event.preventDefault();
    successfullSubmit = false;
    if (!TASK_FORM.checkValidity()) {
      const invalidElements = TASK_FORM.querySelectorAll(":invalid");
      invalidElements.forEach((element) => {
        if (element.id === "task-due-date") {
        } else {
          element.classList.add("invalid");
        }
      });

      invalidElements.forEach((element) => {
        if (element.id === "task-due-date") {
          element
            .closest(".required")
            .classList.add("custom-select-with-after", "invalid");
        } else {
          element.closest(".required").classList.add("input-with-after");
        }
      });

      TASK_FORM.querySelector(":invalid").focus();

      TASK_FORM.querySelector(":invalid").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    if (selectedCategory == "Select task category") {
      CATEGORIES_DROPDOWN.classList.add("custom-select-with-after");
      CATEGORY_TRIGGER.classList.add("invalid");
    }

    if (
      TASK_FORM.checkValidity() &&
      selectedCategory == "Select task category"
    ) {
      CATEGORY_TRIGGER.focus();
      CATEGORY_TRIGGER.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  } else if (
    TASK_FORM.checkValidity() &&
    selectedCategory !== "Select task category"
  ) {
    successfullSubmit = true;
  }
}

function contactsDropdownFocusOutFunction() {
  const nextFocused = event.relatedTarget;
  const CONTACT_INPUT = document.getElementById("search-contact-input");
  const CONTACTS_DROPDOWN = document.getElementById("contacts-dropdown");

  if (!CONTACTS_DROPDOWN.contains(nextFocused)) {
    CONTACT_INPUT.value = "";
    let inputValue = CONTACT_INPUT.value;
    filterContacts(inputValue);
    closeCustomSelectDropdown("contacts");
  }
}

function categoriesDropdownClickFunction() {
  const CATEGORIES_DROPDOWN = document.getElementById("categories-dropdown");
  const CATEGORY_TRIGGER = document.getElementById(
    "custom-select-trigger-category",
  );

  if (successfullSubmit == false) {
    CATEGORIES_DROPDOWN.classList.add("custom-select-with-after");
    CATEGORY_TRIGGER.classList.add("invalid");
  } else {
    CATEGORIES_DROPDOWN.classList.remove("custom-select-with-after");
    CATEGORY_TRIGGER.classList.remove("invalid");
  }
}

function categoriesDropdownFocusOutFunction() {
  const CATEGORIES_DROPDOWN = document.getElementById("categories-dropdown");

  const nextFocused = event.relatedTarget;

  if (!CATEGORIES_DROPDOWN.contains(nextFocused)) {
    closeCustomSelectDropdown("category");
  }
}

// #endregion

// done
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
    contactOptionsCheckboxesEnterHandlers();
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

// done
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

// done
// #region contacts

let contactsOptions = [];
let filteredContacts = [];
let assignedContacts = [];

function selectContact(indexContact, contactId, clickViaCheckbox) {
  handleContactSelection(indexContact, contactId, clickViaCheckbox);
  renderAssignedContacts();
}

function checkIfContactAlreadyAssigned(contactId) {
  for (let index = 0; index < assignedContacts.length; index++) {
    if (assignedContacts[index].id === contactId) {
      return index;
    }
  }
}

function handleContactSelection(indexContact, contactId, clickViaCheckbox) {
  let checkbox = document.getElementById("checkbox" + indexContact);
  let indexAssignedContact = checkIfContactAlreadyAssigned(contactId);

  // handle checkbox when selecting contact by not using the checkbox
  if (!clickViaCheckbox) {
    if (checkbox.checked == true) {
      checkbox.checked = false;
      assignedContacts.splice(indexAssignedContact, 1);
    } else {
      checkbox.checked = true;
      assignedContacts.push(filteredContacts[indexContact]);
    }
  } else {
    event.stopPropagation();
    if (checkbox.checked == true) {
      assignedContacts.push(filteredContacts[indexContact]);
    } else {
      assignedContacts.splice(indexAssignedContact, 1);
    }
  }
}

async function renderContactOptions() {
  sortContactOptions();
  document.getElementById("select-options--contacts").innerHTML = "";
  renderContactOptionsList();
}

function sortContactOptions() {
  filteredContacts.sort((a, b) => a.name.localeCompare(b.name));
  ensureUserIsFirstInContactsArr();
}

function renderContactOptionsList() {
  for (
    let indexContact = 0;
    indexContact < filteredContacts.length;
    indexContact++
  ) {
    let contactInitials = getContactInitials(
      filteredContacts[indexContact].name,
    );
    let contactName = getContactName(indexContact);
    let checkboxChecked = checkIfContactAssigned(
      filteredContacts[indexContact],
    );

    document.getElementById("select-options--contacts").innerHTML +=
      contactOptionTemplate(
        indexContact,
        contactInitials,
        contactName,
        checkboxChecked,
      );
  }
}

function getContactName(indexContact) {
  let user = getCurrentUser();

  if (user !== null && filteredContacts[indexContact].name === user.name) {
    return filteredContacts[indexContact].name + " (You)";
  } else {
    return filteredContacts[indexContact].name;
  }
}

function getCurrentUser() {
  const stored = localStorage.getItem("currentUser");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

function ensureUserIsFirstInContactsArr() {
  let user = getCurrentUser();
  let userPartOfArr = filteredContacts.some(
    (contact) => contact.name === user.name,
  );

  if (!user || user.name === "Guest" || !userPartOfArr) return;

  // filter user out of contacts arr
  filteredContacts = filteredContacts.filter(
    (contact) => contact.name !== user.name,
  );

  filteredContacts.unshift(user);
}

function checkIfContactAssigned(contact) {
  return assignedContacts.some(
    (assignedContact) => assignedContact.name === contact.name,
  );
}

async function getContacts() {
  let response = await fetch(BASE_URL + "contacts" + ".json");
  let contactsObj = await response.json();

  if (contactsObj) {
    fillContactsOptionsArray(contactsObj);
  }
}

function fillContactsOptionsArray(contactsObj) {
  let keysArr = Object.keys(contactsObj);

  for (let i = 0; i < keysArr.length; i++) {
    let id = keysArr[i];

    let contactData = {
      id: id,
      color: contactsObj[id].color,
      name: contactsObj[id].name,
    };

    contactsOptions.push(contactData);
  }

  addUserToContactsOptionsArray();
}

function addUserToContactsOptionsArray() {
  let user = getCurrentUser();
  if (!user || user.name === "Guest") return;
  contactsOptions.unshift(user);
}

function getContactInitials(name) {
  let firstLetter = name.charAt(0);
  let spaceIndex = name.indexOf(" ");
  let secondLetter = "";

  if (spaceIndex !== -1 && name.charAt(spaceIndex + 1) !== "(") {
    secondLetter = name.charAt(spaceIndex + 1);
  }

  return (firstLetter + secondLetter).toUpperCase();
}

function renderAssignedContacts() {
  const SELECTED_CONTACTS_DIV = document.getElementById(
    "selected-contacts-container",
  );

  SELECTED_CONTACTS_DIV.innerHTML = "";
  for (let index = 0; index < assignedContacts.length; index++) {
    let contactInitials = getContactInitials(assignedContacts[index].name);
    SELECTED_CONTACTS_DIV.innerHTML += contactAvatarTemplate(
      index,
      contactInitials,
    );
  }
}

// #region filter contacts

function handleContactsSearch() {
  let searchContactsInput = document.getElementById(
    "search-contact-input",
  ).value;
  filterContacts(searchContactsInput);
  renderContactOptions();
}

function filterContacts(inputValue) {
  const searchValue = inputValue.toLowerCase().trim();

  if (!inputValue) {
    filteredContacts = contactsOptions;
  } else {
    filteredContacts = contactsOptions.filter((obj) => {
      return obj.name
        .toLowerCase()
        .split(" ")
        .some((namePart) => namePart.startsWith(searchValue));
    });
  }
}

// #endregion

// #endregion

// done
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

// done
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

// done
// #region add task

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

// #endregion
