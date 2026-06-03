let contactsOptions = [];
let filteredContacts = [];
let assignedContacts = [];

/**
 * Selects or deselects a contact and updates the assigned contacts display.
 * @param {number} indexContact - The index of the contact in the filtered contacts list
 * @param {string} contactId - The unique ID of the contact
 * @param {boolean} clickViaCheckbox - Whether the selection was triggered by clicking the checkbox
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
 * Manages the selection or deselection of a contact, updating checkboxes and assigned contacts.
 * @param {number} indexContact - The index of the contact
 * @param {string} contactId - The unique ID of the contact
 * @param {boolean} clickViaCheckbox - Whether the action was triggered by the checkbox
 */
function handleContactSelection(indexContact, contactId, clickViaCheckbox, id) {
  let checkbox = document.getElementById("checkbox" + indexContact + id);
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
    if (checkbox.checked === true) {
      assignedContacts.push(filteredContacts[indexContact]);
    } else {
      assignedContacts.splice(indexAssignedContact, 1);
    }
  }
}

/**
 * Fetches and renders all available contact options in the dropdown.
 * @async
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
 */
function sortContactOptions() {
  filteredContacts.sort((a, b) => a.name.localeCompare(b.name));
  ensureUserIsFirstInContactsArr();
}

/**
 * Renders the contact options list with avatars and names.
 */
function renderContactOptionsList(id) {
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

    document.getElementById("select-options--contacts" + id).innerHTML +=
      contactOptionTemplate(
        indexContact,
        contactInitials,
        contactName,
        checkboxChecked,
        id,
      );
  }
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
 */
function ensureUserIsFirstInContactsArr() {
  let currentUser = getCurrentUser();

  if (!currentUser || currentUser.name === "Guest") return;

  // filter user out of contacts arr
  filteredContacts = filteredContacts.filter(
    (contact) => contact.name !== currentUser.name,
  );

  filteredContacts.unshift(currentUser);
}

/**
 * Checks if a contact is assigned by comparing contact names.
 * @param {Object} contact - The contact object to check
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
 */
async function getContacts() {
  let response = await fetch(BASE_URL + "contacts" + ".json");
  let contactsObj = await response.json();

  if (contactsObj) {
    fillContactsOptionsArray(contactsObj);
  }
}

async function getUsers() {
  let response = await fetch(BASE_URL + "users" + ".json");
  let usersObj = await response.json();

  if (usersObj) {
    fillContactsOptionsArray(usersObj);
  }
}

/**
 * Populates the contactsOptions array with contacts from the Firebase response object.
 * @param {Object} contactsObj - The contacts object from Firebase
 */
function fillContactsOptionsArray(object) {
  let keysArr = Object.keys(object);

  for (let i = 0; i < keysArr.length; i++) {
    let id = keysArr[i];

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
 */
function addUserToContactsOptionsArray() {
  let user = getCurrentUser();
  if (!user || user.name === "Guest") return;
  contactsOptions.unshift(user);
}

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
 */
function renderAssignedContacts(id) {
  const SELECTED_CONTACTS_DIV = document.getElementById(
    "selected-contacts-container" + id,
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

/**
 * Handles the contact search input by filtering contacts and re-rendering the dropdown.
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

// #endregion
