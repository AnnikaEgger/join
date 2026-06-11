let contactsOptions = [];
let filteredContacts = [];
let assignedContacts = [];

/**
 * Selects or deselects a contact and updates the assigned contacts display.
 * @param {number} indexContact - The index of the contact in the filtered contacts list
 * @param {string} contactId - The unique ID of the contact
 * @param {boolean} clickViaCheckbox - Whether the selection was triggered by clicking the checkbox
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function selectContact(indexContact, contactId, clickViaCheckbox, id) {
  handleContactSelection(indexContact, contactId, clickViaCheckbox, id);
  renderAssignedContacts(id);
}

/**
 * Checks if a contact is already assigned by ID.
 * @param {string} contactId - The unique ID of the contact
 * @returns {number|undefined} The index of the contact in assignedContacts or undefined if not found
 */
function checkIfContactAlreadyAssigned(contactId) {
  for (let index = 0; index < assignedContacts.length; index++) {
    if (assignedContacts[index].id === contactId) {
      return index;
    }
  }
}

/**
 * Manages contact selection or deselection, updating checkbox state and assigned contacts.
 * @param {number} indexContact - The index of the contact
 * @param {string} contactId - The unique ID of the contact
 * @param {boolean} clickViaCheckbox - Whether the action was triggered by the checkbox
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function handleContactSelection(indexContact, contactId, clickViaCheckbox, id) {
  let checkbox = document.getElementById("checkbox" + indexContact + id);
  let indexAssignedContact = checkIfContactAlreadyAssigned(contactId);
  if (!clickViaCheckbox) {
    handleSelectionViaLi(checkbox, indexAssignedContact, indexContact);
  } else {
    handleSelectionViaCheckbox(checkbox, indexAssignedContact, indexContact);
  }
}

/**
 * Handles the selection or deselection logic when the list item row is clicked.
 * @param {HTMLInputElement} checkbox - The checkbox element to toggle
 * @param {number|undefined} indexAssignedContact - The index in assignedContacts, if found
 * @param {number} indexContact - The index of the contact in the filtered list
 * @returns {void}
 */
function handleSelectionViaLi(checkbox, indexAssignedContact, indexContact) {
  if (checkbox.checked == true) {
    checkbox.checked = false;
    assignedContacts.splice(indexAssignedContact, 1);
  } else {
    checkbox.checked = true;
    assignedContacts.push(filteredContacts[indexContact]);
  }
}

/**
 * Handles the selection or deselection logic when clicking directly on the checkbox.
 * @param {HTMLInputElement} checkbox - The checkbox element that was clicked
 * @param {number|undefined} indexAssignedContact - The index in assignedContacts, if found
 * @param {number} indexContact - The index of the contact in the filtered list
 * @returns {void}
 */
function handleSelectionViaCheckbox(
  checkbox,
  indexAssignedContact,
  indexContact,
) {
  event.stopPropagation();
  if (checkbox.checked === true) {
    assignedContacts.push(filteredContacts[indexContact]);
  } else {
    assignedContacts.splice(indexAssignedContact, 1);
  }
}

/**
 * Fetches and renders all available contact options in the dropdown.
 * @async
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {Promise<void>}
 */
async function renderContactOptions(id) {
  sortContactOptions();
  document.getElementById("select-options--contacts" + id).innerHTML = "";
  renderContactOptionsList(id);
  contactOptionsEnterHandlers();
  contactOptionsCheckboxesEnterHandlers();
}

/**
 * Sorts the filtered contacts alphabetically by name, ensuring the current user is first.
 * @returns {void}
 */
function sortContactOptions() {
  filteredContacts.sort((a, b) => a.name.localeCompare(b.name));
  ensureUserIsFirstInContactsArr();
}

/**
 * Renders the contact options list with avatars and names.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function renderContactOptionsList(id) {
  for (
    let indexContact = 0;
    indexContact < filteredContacts.length;
    indexContact++
  ) {
    renderContactOptionsListHTML(id, indexContact);
  }
}

/**
 * Appends the HTML template for a single contact option to the list.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @param {number} indexContact - The index of the contact in the filtered list
 * @returns {void}
 */
function renderContactOptionsListHTML(id, indexContact) {
  let contactInitials = getContactInitials(filteredContacts[indexContact].name);
  let contactName = getContactName(indexContact);
  let checkboxChecked = checkIfContactAssigned(filteredContacts[indexContact]);
  document.getElementById("select-options--contacts" + id).innerHTML +=
    contactOptionTemplate(
      indexContact,
      contactInitials,
      contactName,
      checkboxChecked,
      id,
    );
}

/**
 * Retrieves the display name for a contact, appending "(You)" if it's the current user.
 * @param {number} indexContact - The index of the contact
 * @returns {string} The contact name with optional "(You)" suffix
 */
function getContactName(indexContact) {
  let user = getCurrentUser();
  if (user !== null && filteredContacts[indexContact].name === user.name) {
    return filteredContacts[indexContact].name + " (You)";
  } else {
    return filteredContacts[indexContact].name;
  }
}

/**
 * Retrieves the current user object from localStorage.
 * @returns {Object|null} The user object or null if not found
 */
function getCurrentUser() {
  const stored = localStorage.getItem("currentUser");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

/**
 * Ensures the current user is the first contact in the filtered contacts array.
 * @returns {void}
 */
function ensureUserIsFirstInContactsArr() {
  let currentUser = getCurrentUser();
  const userPartOfFilteredContacts = filteredContacts.some(
    (contact) => contact.name === currentUser.name,
  );
  if (
    !currentUser ||
    currentUser.name === "Guest" ||
    !userPartOfFilteredContacts
  )
    return;
  changeUserPositionInArray(currentUser);
}

/**
 * Moves the current user to the front of the filtered contacts array.
 * @param {Object} currentUser - The current user object
 * @returns {void}
 */
function changeUserPositionInArray(currentUser) {
  filteredContacts = filteredContacts.filter(
    (contact) => contact.name !== currentUser.name,
  );
  filteredContacts.unshift(currentUser);
}

/**
 * Checks if a contact is assigned by comparing contact names.
 * @param {Contact} contact - The contact object to check
 * @returns {boolean} True if the contact is assigned, false otherwise
 */
function checkIfContactAssigned(contact) {
  return assignedContacts.some(
    (assignedContact) => assignedContact.name === contact.name,
  );
}

/**
 * Fetches all contacts from Firebase and populates the contactsOptions array.
 * @async
 * @returns {Promise<void>}
 */
async function getContacts() {
  let response = await fetch(BASE_URL + "contacts" + ".json");
  let contactsObj = await response.json();
  if (contactsObj) {
    fillContactsOptionsArray(contactsObj);
  }
}

/**
 * Fetches all users from Firebase and populates the contactsOptions array.
 * @async
 * @returns {Promise<void>}
 */
async function getUsers() {
  let response = await fetch(BASE_URL + "users" + ".json");
  let usersObj = await response.json();
  if (usersObj) {
    fillContactsOptionsArray(usersObj);
  }
}

/**
 * Populates the contactsOptions array with contacts from the Firebase response object.
 * @param {Object} object - The response object from Firebase containing data keys
 * @returns {void}
 */
function fillContactsOptionsArray(object) {
  let keysArr = Object.keys(object);
  for (let i = 0; i < keysArr.length; i++) {
    let id = keysArr[i];
    if (id === "dummy_placeholder") continue;
    let contactData = {
      id: id,
      color: object[id].color,
      name: object[id].name,
    };
    contactsOptions.push(contactData);
  }
}

/**
 * Adds the current user to the beginning of the contacts options array if logged in.
 * @returns {void}
 */
function addUserToContactsOptionsArray() {
  let user = getCurrentUser();
  if (!user || user.name === "Guest") return;
  contactsOptions.unshift(user);
}