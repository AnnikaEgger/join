/**
 * Extracts and returns the initials from a contact name.
 * @param {string} name - The contact's full name
 * @returns {string} The initials in uppercase (max 2 characters)
 */
function getContactInitials(name) {
  let firstLetter = name.charAt(0);
  let spaceIndex = name.indexOf(" ");
  let secondLetter = "";
  if (spaceIndex !== -1 && name.charAt(spaceIndex + 1) !== "(") {
    secondLetter = name.charAt(spaceIndex + 1);
  }
  return (firstLetter + secondLetter).toUpperCase();
}

/**
 * Renders the assigned contacts as avatar badges in the container.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function renderAssignedContacts(id) {
  const SELECTED_CONTACTS_DIV = document.getElementById(
    "selected-contacts-container" + id,
  );
  let contactsToRender = getAssignedContactstoRender();
  SELECTED_CONTACTS_DIV.innerHTML = "";
  if (!contactsToRender) return;
  renderHTMLForAssignedContacts(contactsToRender, SELECTED_CONTACTS_DIV);
}

/**
 * Iterates through the contacts to render and appends their avatar templates.
 * @param {AssignedContact[]} contactsToRender - Array of contacts to be rendered
 * @param {HTMLElement} SELECTED_CONTACTS_DIV - The container element for the badges
 * @returns {void}
 */
function renderHTMLForAssignedContacts(
  contactsToRender,
  SELECTED_CONTACTS_DIV,
) {
  for (let index = 0; index < contactsToRender.length; index++) {
    let contactInitials = getContactInitials(contactsToRender[index].name);
    SELECTED_CONTACTS_DIV.innerHTML += contactAvatarTemplate(
      index,
      contactInitials,
    );
  }
  renderOverflowBadge(SELECTED_CONTACTS_DIV);
}

/**
 * Returns the first five assigned contacts to display in the selected badge area.
 * @returns {AssignedContact[]|undefined} The contacts to render, or undefined when none are assigned.
 */
function getAssignedContactstoRender() {
  if (assignedContacts.length === 0) return;
  let contactsToRender = assignedContacts.slice(0, 5);
  return contactsToRender;
}

/**
 * Appends an overflow badge when more than five contacts are assigned.
 * @param {HTMLElement} SELECTED_CONTACTS_DIV - The container that holds the selected contact badges.
 * @returns {void}
 */
function renderOverflowBadge(SELECTED_CONTACTS_DIV) {
  let extraCount = assignedContacts.length - 5;
  if (extraCount > 0) {
    SELECTED_CONTACTS_DIV.innerHTML +=
      generateOverflowBadgeTemplate(extraCount);
  }
}

/**
 * Checks every task and removes assigned contacts that no longer exist.
 * @async
 * @returns {Promise<void>}
 */
async function checkIfAssignedContactStillExists() {
  let response = await fetch(BASE_URL + "tasks.json");
  let tasks = await response.json();
  contactsOptions = [];
  await getContacts();
  await getUsers();
  checkEachTaskForRedundantContacts(tasks);
}

/**
 * Iterates over all tasks to identify and handle redundant assigned contacts.
 * @param {Object} tasks - The tasks object from Firebase
 * @returns {void}
 */
function checkEachTaskForRedundantContacts(tasks) {
  Object.entries(tasks).forEach(([taskId, task]) => {
    if (!task.assigned_contacts) return;
    const hasInvalidContacts = Object.values(task.assigned_contacts).some(
      (contact) =>
        !contactsOptions.some(
          (c) => c.id === contact.id && c.name === contact.name,
        ),
    );
    if (hasInvalidContacts) {
      collectValidAssignedContacts(task, taskId);
    }
  });
}

/**
 * Filters a task's assigned contacts to only those that still exist in contactsOptions.
 * @param {Object} task - The task object containing assigned contacts
 * @param {string} taskId - The ID of the task being checked
 * @returns {void}
 */
function collectValidAssignedContacts(task, taskId) {
  let assignedTaskContacts = [];
  for (const contact of Object.values(task.assigned_contacts || {})) {
    const exists = contactsOptions.some(
      (c) => c.id === contact.id && c.name === contact.name,
    );
    if (exists) {
      assignedTaskContacts.push(contact);
    }
  }
  putAssignedContacts(taskId, assignedTaskContacts);
}

/**
 * Writes the filtered assigned contacts back to the task in Firebase.
 * @async
 * @param {string} taskId - The ID of the task to update
 * @param {Array<Object>} assignedTaskContacts - The filtered array of assigned contacts
 * @returns {Promise<void>}
 */
async function putAssignedContacts(taskId, assignedTaskContacts) {
  await fetch(
    BASE_URL + "tasks/" + taskId + "/assigned_contacts.json",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assignedTaskContacts),
    },
  );
}

/**
 * Handles the contact search input by filtering contacts and re-rendering the dropdown.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function handleContactsSearch(id) {
  let searchContactsInput = document.getElementById(
    "search-contact-input" + id,
  ).value;
  filterContacts(searchContactsInput);
  renderContactOptions(id);
}

/**
 * Filters contacts based on the search input value.
 * @param {string} inputValue - The search input value
 * @returns {void}
 */
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