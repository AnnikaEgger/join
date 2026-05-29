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
    if (checkbox.checked === true) {
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
  contactOptionsEnterHandlers();
  contactOptionsCheckboxesEnterHandlers();
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
