const BASE_URL =
  "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/";
let successfullSubmit;

// map --> saves key value paires
const enterHandlers = new Map();

// set key value pairs --> selector (html element) + handler (function on the element)
function registerEnterHandler(selector, handler) {
  // save pair to map

  // check if handler already exists (for lis)?
  enterHandlers.set(selector, handler);
}

function registerEnterHandlerHelpFunction(index, returnFunction) {
  return () => {
    returnFunction(index);
  };
}

async function init() {
  const CATEGORIES_DROPDOWN = document.getElementById("categories-dropdown");
  const TASK_FORM = document.getElementById("task-form");
  const CATEGORY_TRIGGER = document.getElementById(
    "custom-select-trigger-category",
  );
  const SEARCH_INPUT = document.getElementById("search-contact-input");
  const CONTACTS_DROPDOWN = document.getElementById("contacts-dropdown");

  disablePastDates();

  renderSelectedCategory();
  renderPriority();

  await getContacts();
  filteredContacts = contactsOptions;

  renderContactOptions();

  // await putDefaultTasksToFirebase();

  await getCategories();
  renderCategories();

  registerEnterHandler("#custom-select-trigger-contacts", () => {
    toggleCustomSelectDropdown("contacts");
  });
  registerEnterHandler("search-contact-input", () => {});

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

  let contactOptionsCheckboxes = document.querySelectorAll(
    ".contact-option-checkbox",
  );
  contactOptionsCheckboxes.forEach((checkbox) => {
    registerEnterHandler("#checkbox" + checkbox.dataset.indexContact, () => {
      selectContact(
        checkbox.dataset.indexContact,
        filteredContacts[checkbox.dataset.indexContact].id,
        false,
      );
    });
  });

  registerEnterHandler("#custom-select-trigger-category", () => {
    toggleCustomSelectDropdown("category");
  });
  let categoryOptions = document.querySelectorAll(".category-option");
  categoryOptions.forEach((option) => {
    registerEnterHandler(
      "#category-option-" + option.dataset.indexCategory,
      () => {
        selectCategory(categoriesArr[option.dataset.indexCategory].title);
      },
    );
  });

  registerEnterHandler("#subtask-input", addSubtask);

  TASK_FORM.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    const el = event.target;
    // check if the element is an html element
    if (!(el instanceof HTMLElement)) return;
    if (el.tagName === "BUTTON") return;
    if (el.tagName === "TEXTAREA") return;
    // if (el.classList.contains(".display-none")) return;

    if (
      el.tagName === "INPUT" &&
      el.id !== "search-contact-input" &&
      el.id !== "subtask-input" &&
      !el.id.startsWith("li-input")
    ) {
      el.blur();
    }

    event.preventDefault();

    for (const [selector, handler] of enterHandlers) {
      // debugger;
      // if element was setted to our map
      if (el.matches(selector)) {
        // debugger;

        handler();
        break;
      }
    }
  });

  // check validity of form when pressing enter or submit button

  TASK_FORM.addEventListener("submit", (e) => {
    // let titleInput = document.getElementById("task-title");
    if (
      !TASK_FORM.checkValidity() ||
      selectedCategory == "Select task category"
    ) {
      e.preventDefault();
      successfullSubmit = false;
      if (!TASK_FORM.checkValidity()) {
        // if (!titleInput.checkValidity()) {
        //   titleInput.classList.add("invalid");
        // }
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
  });

  CATEGORIES_DROPDOWN.addEventListener("click", function () {
    if (successfullSubmit == false) {
      CATEGORIES_DROPDOWN.classList.add("custom-select-with-after");
      CATEGORY_TRIGGER.classList.add("invalid");
    } else {
      CATEGORIES_DROPDOWN.classList.remove("custom-select-with-after");
      CATEGORY_TRIGGER.classList.remove("invalid");
    }
  });

  CONTACTS_DROPDOWN.addEventListener("focusout", (event) => {
    const nextFocused = event.relatedTarget;
    const CONTACT_INPUT = document.getElementById("search-contact-input");

    if (!CONTACTS_DROPDOWN.contains(nextFocused)) {
      CONTACT_INPUT.value = "";
      let inputValue = CONTACT_INPUT.value;
      filterContacts(inputValue);
      closeCustomSelectDropdown("contacts");
    }
  });

  CATEGORIES_DROPDOWN.addEventListener("focusout", (event) => {
    const nextFocused = event.relatedTarget;

    if (!CATEGORIES_DROPDOWN.contains(nextFocused)) {
      closeCustomSelectDropdown("category");
    }
  });
}

function closeCustomSelectDropdown(selectName) {
  let options = document.getElementById("select-options" + "--" + selectName);
  let arrow = document.getElementById("arrow-dropdown" + "--" + selectName);
  options.classList.add("display-none");
  options.setAttribute("inert", "");

  arrow.classList.remove("rotate");
}

function toggleCustomSelectDropdown(selectName) {
  let options = document.getElementById("select-options" + "--" + selectName);
  let arrow = document.getElementById("arrow-dropdown" + "--" + selectName);

  if (selectName === "contacts" && options.classList.contains("display-none")) {
    renderContactOptions();
  }

  options.classList.toggle("display-none");
  if (options.classList.contains("display-none")) {
    options.setAttribute("inert", "");
  } else {
    options.removeAttribute("inert");
  }
  arrow.classList.toggle("rotate");
  if (selectName == "category") {
    selectedCategory = "Select task category";
    renderSelectedCategory();
  }
}

function checkStopPropagation(event) {
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

async function renderContactOptions(filtered) {
  sortContactOptions(filtered);
  document.getElementById("select-options--contacts").innerHTML = "";
  renderContactOptionsList();
}

function sortContactOptions(filtered) {
  filteredContacts.sort((a, b) => a.name.localeCompare(b.name));
  if (!filtered) {
    ensureUserIsFirstInContactsArr();
  }
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

// weiter ab hier
function ensureUserIsFirstInContactsArr() {
  let user = getCurrentUser();

  if (!user || user.name === "Guest") return;

  // // filter user out of contacts arr
  // filteredContacts = filteredContacts.filter(
  //   (contact) => contact.name !== user.name,
  // );

  // filteredContacts.unshift(user);

  // filter user out of contacts arr
  contactsOptions = contactsOptions.filter(
    (contact) => contact.name !== user.name,
  );

  contactsOptions.unshift(user);
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

function filterContacts1() {
  let searchContactsInput = document.getElementById(
    "search-contact-input",
  ).value;
  filterContacts(searchContactsInput);
  renderContactOptions(true);
}

function filterContacts(inputValue) {
  const searchValue = inputValue.toLowerCase().trim();

  filteredContacts = filteredContacts.filter((obj) => {
    return obj.name
      .toLowerCase()
      .split(" ")
      .some((namePart) => namePart.startsWith(searchValue));
  });
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

    registerEnterHandler(
      "#subtask-li-" + index,
      registerEnterHandlerHelpFunction(index, openSubtaskEdit),
    );
  }

  SUBTASK_INPUT_REF.value = "";
}

function renderSingleSubtask(indexSubtask) {
  let li = document.getElementById("subtask-li-" + indexSubtask);
  li.outerHTML = subtaskLiTemplate(subtasksArr[indexSubtask], indexSubtask);

  registerEnterHandler(
    "#subtask-li-" + indexSubtask,
    registerEnterHandlerHelpFunction(indexSubtask, openSubtaskEdit),
  );
}

function openSubtaskEdit(indexSubtask) {
  const li = document.getElementById("subtask-li-" + indexSubtask);
  li.outerHTML = subtaskLiWithInputTemplate(indexSubtask);

  registerEnterHandler(
    "#li-input" + indexSubtask,
    registerEnterHandlerHelpFunction(indexSubtask, submitEditedSubtask),
  );

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

// done
// #region templates
function subtaskLiTemplate(subtaskText, indexSubtask) {
  return `<li id="${"subtask-li-" + indexSubtask}" class="normal-li" tabindex="0" 
              data-index-subtask="${indexSubtask}"
                ondblclick="openSubtaskEdit(${indexSubtask})"
              >
            <p class="normal-li-p" id="${"subtask-text" + indexSubtask}">${subtaskText}</p>
            <div
              class="subtask-btns-container subtask-btns-container--ul"
            >
              <button
                type="button"
                class="subtask-btn-left normal-li-edit-btn"
                onclick="openSubtaskEdit(${indexSubtask})"
                aria-label="edit subtask"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 16.25H3.4L12.025 7.625L10.625 6.225L2 14.85V16.25ZM16.3 6.175L12.05 1.975L13.45 0.575C13.8333 0.191667 14.3042 0 14.8625 0C15.4208 0 15.8917 0.191667 16.275 0.575L17.675 1.975C18.0583 2.35833 18.2583 2.82083 18.275 3.3625C18.2917 3.90417 18.1083 4.36667 17.725 4.75L16.3 6.175ZM14.85 7.65L4.25 18.25H0V14L10.6 3.4L14.85 7.65Z"
                    fill="#2A3647"
                  />
                </svg>
              </button>
              <div class="subtask-btns-seperation-line"></div>
              <button
                type="button"
                class="subtask-btn-right normal-li-delete-btn"
                onclick="deleteSubtask(${indexSubtask})"
                aria-label="delete subtask"

              >
                <svg
                  width="16"
                  height="18"
                  viewBox="0 0 16 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z"
                    fill="#2A3647"
                  />
                </svg>
              </button>
            </div>
          </li>`;
}

function subtaskLiWithInputTemplate(indexSubtask) {
  return ` <li id="${"subtask-li-" + indexSubtask}" class="li-with-input trigger-input-container" tabindex="0">
            <input id="${"li-input" + indexSubtask}" type="text" value="${subtasksArr[indexSubtask]}" />
            <div
              class="subtask-btns-container subtask-btns-container--ul"
            >
              <button
                type="button"
                class="subtask-btn-left"
                id="delete-subtask-btn"
                onclick="deleteSubtask(${indexSubtask})"
                aria-label="delete subtask"
              >
                <svg
                  width="16"
                  height="18"
                  viewBox="0 0 16 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z"
                    fill="#2A3647"
                  />
                </svg>
              </button>

              <div class="subtask-btns-seperation-line"></div>

              <button onclick="submitEditedSubtask(${indexSubtask})" class="subtask-btn-right" type="button" aria-label="edit subtask">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 8.5L5 12.5L13 1"
                    stroke="#2A3647"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </li>`;
}

function contactOptionTemplate(
  indexContact,
  initials,
  contactName,
  checkboxChecked,
) {
  return `<li
            id="contact-option-${indexContact}"
            data-index-contact="${indexContact}"
            role="option"
            onclick="selectContact(${
              indexContact
            },'${filteredContacts[indexContact].id}', false)"
            class="custom-select--option contact-option"
            tabindex="0"
           
          >
            <div class="contact-container">
              <div class="contact-avatar" style="background-color: ${filteredContacts[indexContact].color}">
                <p class="contact-avatar--initials">${initials}</p>
              </div>
              <p class="contact-full-name" id="contact-full-name">${contactName}</p>
            </div>
            <div class="checkbox-container">
              <input
              class="contact-option-checkbox"
               data-index-contact="${indexContact}"
               onclick="selectContact(${
                 indexContact
               },'${filteredContacts[indexContact].id}', true)"
                type="checkbox"
                aria-label="assign contact"
                name=""
                id="checkbox${indexContact}"
                value="${filteredContacts[indexContact].name}"
                ${checkboxChecked ? "checked" : ""}
              />
            </div>
          </li>`;
}

function contactAvatarTemplate(indexAssignedContact, initials) {
  return ` <div class="contact-avatar" style="background-color: ${assignedContacts[indexAssignedContact].color}">
            <p class="contact-avatar--initials">${initials}</p>
          </div>`;
}

function categoryOptionTemplate(indexCategory) {
  return `<li
            class="custom-select--option category-option"
            id="category-option-${indexCategory}"
            data-index-category="${indexCategory}"
            onclick="selectCategory('${categoriesArr[indexCategory].title}')"
            onkeypress="selectCategory('${categoriesArr[indexCategory].title}')"
            tabindex="0"
          >
            ${categoriesArr[indexCategory].title}
          </li>`;
}

// #endregion
