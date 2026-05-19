const BASE_URL =
  "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/";

async function init() {
  filteredContacts = contactsOptions;
  renderSelectedCategory();
  renderPriority();

  await getContacts();
  renderContactOptions();

  await getCategories();
  renderCategories();

  const TASK_FORM = document.getElementById("task-form");
  // check validity of form when pressing enter or submit button
  TASK_FORM.addEventListener("submit", (e) => {
    if (!TASK_FORM.checkValidity()) {
      e.preventDefault();
      TASK_FORM.querySelector(":invalid").focus();
    }
  });

  const SEARCH_INPUT = document.getElementById("search-contact-input");
  const CONTACTS_DROPDOWN = document.getElementById("contacts-dropdown");

  CONTACTS_DROPDOWN.addEventListener("focusout", (event) => {
    // event.relatedTarget = das element, das jetzt den Fokus bekommt
    // event object --> dort Info enthalten, welches Element Fokus verloren hat + welches jetzt den Fokus hat
    const nextFocused = event.relatedTarget;

    if (!CONTACTS_DROPDOWN.contains(nextFocused)) {
      closeCustomSelectDropdown("contacts");
    }
  });

  const CATEGORIES_DROPDOWN = document.getElementById("categories-dropdown");
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
  arrow.classList.remove("rotate");
}

function toggleCustomSelectDropdown(selectName) {
  let options = document.getElementById("select-options" + "--" + selectName);
  let arrow = document.getElementById("arrow-dropdown" + "--" + selectName);

  options.classList.toggle("display-none");
  arrow.classList.toggle("rotate");
}

function checkStopPropagation(event) {
  let options = document.getElementById("select-options" + "--" + "contacts");

  if (!options.classList.contains("display-none")) {
    event.stopPropagation();
  }
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

// #region contacts

let contactsOptions = [];
let filteredContacts = [];
let assignedContacts = [];

function selectContact(indexContact, contactId, clickViaCheckbox) {
  let checkbox = document.getElementById("checkbox" + indexContact);
  let indexAssignedContact;

  // check if contact already assigned
  for (let index = 0; index < assignedContacts.length; index++) {
    if (assignedContacts[index].id === contactId) {
      indexAssignedContact = index;
      break;
    }
  }

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
      console.log("new contact assigned");
    } else {
      assignedContacts.splice(indexAssignedContact, 1);
      console.log("assigned contact deleted");
    }
  }

  renderAssignedContacts();
}

async function renderContactOptions() {
  let optionsContainer = document.getElementById("select-options--contacts");

  optionsContainer.innerHTML = "";
  for (
    let indexContact = 0;
    indexContact < filteredContacts.length;
    indexContact++
  ) {
    let contactInitials = getInitials(filteredContacts[indexContact].name);
    optionsContainer.innerHTML += contactOptionTemplate(
      indexContact,
      contactInitials,
    );
  }
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

function getInitials(name) {
  let firstLetter = name.charAt(0);
  let spaceIndex = name.indexOf(" ");
  let secondLetter = "";

  if (spaceIndex !== -1) {
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
    let contactInitials = getInitials(assignedContacts[index].name);
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
  renderContactOptions();
}

function filterContacts(inputValue) {
  filteredContacts = contactsOptions.filter((obj) => {
    const searchValue = inputValue.toLowerCase().trim();

    return obj.name
      .toLowerCase()
      .split(" ")
      .some((namePart) => namePart.startsWith(searchValue));
  });
}

// #endregion

// #endregion

// #region categories

let categoriesArr = [];
let selectedCategory = "Select task category";

async function getCategories() {
  let response = await fetch(BASE_URL + "tasks/categories" + ".json");
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
  let selectedCategoryRef = document.getElementById("selected-category");
  selectedCategoryRef.innerText = selectedCategory;

  closeCustomSelectDropdown("category");
}

// #endregion

// #region subtasks

let subtasksArr = [];

function clearSubtaskInput() {
  const SUBTASK_INPUT_REF = document.getElementById("subtask-input");
  SUBTASK_INPUT_REF.value = "";
}

function addSubtask() {
  let subtaskInput = document.getElementById("subtask-input").value;
  subtasksArr.push(subtaskInput);
  renderSubtasks();
}

function renderSubtasks() {
  const SUBTASK_UL = document.getElementById("subtask-list");
  const SUBTASK_INPUT_REF = document.getElementById("subtask-input");

  SUBTASK_UL.innerHTML = "";

  for (let index = 0; index < subtasksArr.length; index++) {
    SUBTASK_UL.innerHTML += subtaskLiTemplate(subtasksArr[index], index);
  }

  SUBTASK_INPUT_REF.value = "";
}

function editSubtask(indexSubtask) {
  let li = document.getElementById("li" + indexSubtask);

  li.outerHTML = subtaskLiWithInputTemplate(indexSubtask);
}

function submitEditedSubtask(indexSubtask) {
  let edit = document.getElementById("li-input" + indexSubtask).value;

  subtasksArr.splice(indexSubtask, 1, edit);

  renderSubtasks();
}

function deleteSubtask(indexSubtask) {
  subtasksArr.splice(indexSubtask, 1);
  renderSubtasks();
}

// #endregion

// #region add task
let tasks = [];

function addTask() {
  let title = document.getElementById("task-title");
  let description = document.getElementById("task-description");
  let dueDate = document.getElementById("task-due-date");

  let task = {
    title: title.value,
    description: description.value,
    due_date: dueDate.value,
    priority: priority,
    assigned_contacts: assignedContacts,
    category: selectedCategory,
    subtasks: subtasksArr,
  };

  console.log(task);

  tasks.push(task);
  console.log(tasks);

  clearTask();
}

function clearTask() {
  let title = document.getElementById("task-title");
  let description = document.getElementById("task-description");
  let dueDate = document.getElementById("task-due-date");

  title.value = "";
  description.value = "";
  dueDate.value = "";
  priority = "medium";
  assignedContacts = [];
  selectedCategory = "Select task category";
  subtasksArr = [];

  renderAssignedContacts();
  renderSubtasks();
  renderSelectedCategory();
  renderPriority();
}

// #endregion

// #region templates
function subtaskLiTemplate(subtaskText, indexSubtask) {
  return `<li id="${"li" + indexSubtask}" class="normal-li">
            <p id="${"subtask-text" + indexSubtask}">${subtaskText}</p>
            <div
              class="subtask-btns-container subtask-btns-container--ul"
            >
              <button
                type="button"
                class="subtask-btn-left"
                onclick="editSubtask(${indexSubtask})"
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
                class="subtask-btn-right"
                onclick="deleteSubtask(${indexSubtask})"

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
  return ` <li id="${"li" + indexSubtask}" class="li-with-input trigger-input-container">
            <input id="${"li-input" + indexSubtask}" type="text" value="${subtasksArr[indexSubtask]}" />
            <div
              class="subtask-btns-container subtask-btns-container--ul"
            >
              <button
                type="button"
                class="subtask-btn-left"
                id="delete-subtask-btn"
                onclick="deleteSubtask(${indexSubtask})"
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

              <button onclick="submitEditedSubtask(${indexSubtask})" class="subtask-btn-right" type="button">
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

function contactOptionTemplate(indexContact, initials) {
  return `<div
            onclick="selectContact(${
              indexContact
            },'${filteredContacts[indexContact].id}', false)"
            class="custom-select--option"
            tabindex="0"
          >
            <div class="contact-container">
              <div class="contact-avatar" style="background-color: ${filteredContacts[indexContact].color}">
                <p class="contact-avatar--initials">${initials}</p>
              </div>
              <p id="contact-full-name">${filteredContacts[indexContact].name}</p>
            </div>
            <div class="checkbox-container">
              <input
               onclick="selectContact(${
                 indexContact
               },'${filteredContacts[indexContact].id}', true)"
                type="checkbox"
                name=""
                id="checkbox${indexContact}"
                value="${filteredContacts[indexContact].name}"
              />
            </div>
          </div>`;
}

function contactAvatarTemplate(indexAssignedContact, initials) {
  return ` <div class="contact-avatar" style="background-color: ${assignedContacts[indexAssignedContact].color}">
            <p class="contact-avatar--initials">${initials}</p>
          </div>`;
}

function categoryOptionTemplate(indexCategory) {
  return `<div
            class="custom-select--option"
            onclick="selectCategory('${categoriesArr[indexCategory].title}')"
            tabindex="0"
          >
            ${categoriesArr[indexCategory].title}
          </div>`;
}

// #endregion
