let contacts = [];
let currentEditingId = null;

/**
 * Initializes the application by loading and rendering contacts.
 * @async
 * @returns {Promise<void>}
 */
async function init() {
  guardPage();

  await loadContacts();
  await loadAllUsers();
  renderContactList();

  enableAllPointerEvents("--contacts");
}

/**
 * Loads contacts from the database and sorts them alphabetically.
 * @async
 * @returns {Promise<void>}
 */
async function loadContacts() {
  contacts = [];
  let response = await fetch(BASE_URL + "contacts" + ".json");
  let data = await response.json();
  if (data) {
    fillContactsArray(data);
    contacts.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/**
 * Converts the raw database object into an array and assigns IDs.
 * @param {Object} contactsObj - Raw contacts object from the database.
 */
function fillContactsArray(contactsObj) {
  let keys = Object.keys(contactsObj);
  for (let i = 0; i < keys.length; i++) {
    let id = keys[i];

    if (id === "dummy_placeholder") continue;

    let contactData = contactsObj[id];
    contactData.id = id;
    if (!contactData.phone) {
      contactData.phone = "-";
    }
    contacts.push(contactData);
  }
}

/**
 * Loads all registered users from the database and adds them to the contacts list.
 * @async
 * @returns {Promise<void>}
 */
async function loadAllUsers() {
  let response = await fetch(
    "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/users.json",
  );
  let usersObj = await response.json();
  if (usersObj) {
    fillContactsArray(usersObj);
    contacts.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/**
 * Renders the grouped contact list into the DOM.
 */
function renderContactList() {
  let content = document.getElementById("contact-list");
  content.innerHTML = "";
  let currentLetter = "";
  for (let i = 0; i < contacts.length; i++) {
    let contact = contacts[i];
    let firstLetter = contact.name.charAt(0).toUpperCase();
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      content.innerHTML += renderLetterHeader(currentLetter);
    }
    content.innerHTML += generateContactHTML(contact);
  }
}

/**
 * Opens, renders, and animates the detailed view of a contact.
 * @param {string} id - Unique contact ID.
 */
function showContactDetails(id) {
  highlightContact(id);
  let contact = findContactById(id);
  if (contact) {
    prepareDetailsAnimation();
    renderDetails(contact);
    startDetailsAnimation();
  }
}

/**
 * Finds a contact object in the local array by its ID.
 * @param {string} id - Unique contact ID.
 * @returns {Object|null} The contact object, or null if not found.
 */
function findContactById(id) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].id === id) return contacts[i];
  }
  return null;
}

/**
 * Validates, creates, saves, and displays a new contact.
 * @async
 * @returns {Promise<void>}
 */
async function createNewContact() {
  if (!isContactFormValid()) return;
  let emailInput = document.getElementById("contact-email--validator");
  if (isEmailAlreadyUsed(emailInput.value)) {
    emailInput.classList.add("input-error");
    document.getElementById("contact-email--error").innerText =
      "This email is already in use!";
    return;
  }
  disableButtonWhileLoading("btn-submit-contact");
  disableButtonWhileLoading("btn-cancel");
  let name = document.querySelector(".icon-name").value;
  let phone = document.querySelector(".icon-phone").value;
  let newId = await postContact({
    name,
    email: emailInput.value,
    phone,
    color: getRandomColor(),
  });
  await finalizeAddition();
  showContactDetails(newId);
  showSuccessBanner();
  enableButton("btn-submit-contact");
  enableButton("btn-cancel");
}

/**
 * Saves a new contact to the database.
 * @async
 * @param {Object} contact - The contact data object.
 * @returns {Promise<string>} The generated database ID.
 */
async function postContact(contact) {
  let url =
    "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
  let response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });
  let data = await response.json();
  return data.name;
}

/**
 * Checks if an email already exists in the local contacts array.
 * @param {string} email - The email to check.
 * @param {string|null} excludeId - An optional ID to ignore (for editing).
 * @returns {boolean} True if the email is already taken.
 */
function isEmailAlreadyUsed(email, excludeId = null) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].email === email && contacts[i].id !== excludeId) {
      return true;
    }
  }
  return false;
}

/**
 * Closes the dialog and reloads the contact application state.
 * @async
 * @returns {Promise<void>}
 */
async function finalizeAddition() {
  closeContactDialog();
  await init();
}

/**
 * Resets the form inputs and clears all validation errors.
 */
function resetForm() {
  document.querySelector(".contact-form").reset();
  const fields = ["name", "email", "phone"];
  for (let i = 0; i < fields.length; i++) {
    let input = document.getElementById(`contact-${fields[i]}--validator`);
    let errorSpan = document.getElementById(`contact-${fields[i]}--error`);
    if (input) input.classList.remove("input-error");
    if (errorSpan) errorSpan.innerText = "";
  }
}

/**
 * Opens the dialog populated with contact data for editing.
 * @param {string} id - Unique contact ID.
 */
function openEditContact(id) {
  currentEditingId = id;
  let contact = findContactById(id);
  if (contact) {
    updateDialogAvatar(contact);
    fillFormFields(contact);
    adaptDialogForEdit(id);
    openContactDialog();
  }
}

/**
 * Prepares and opens the dialog for creating a new contact.
 */
function prepareAddContactDialog() {
  currentEditingId = null;
  resetForm();
  resetDialogAvatar();
  document.querySelector(".dialog-left h1").innerHTML = "Add contact";
  let btnCreate = document.querySelector(".btn-create");
  btnCreate.innerHTML = `Create contact <img src="../assets/icons/check.svg" alt="Check">`;
  document.querySelector(".contact-form").onsubmit = function () {
    createNewContact();
    return false;
  };
  resetCancelButton();
  openContactDialog();
}

/**
 * Validates and saves changes made to an edited contact.
 * @async
 * @returns {Promise<void>}
 */
async function saveEditedContact() {
  if (!isContactFormValid()) return;
  let emailInput = document.getElementById("contact-email--validator");
  if (isEmailAlreadyUsed(emailInput.value, currentEditingId)) {
    emailInput.classList.add("input-error");
    document.getElementById("contact-email--error").innerText =
      "This email is already in use!";
    return;
  }
  disableButtonWhileLoading("btn-submit-contact");
  disableButtonWhileLoading("btn-cancel");

  let name = document.querySelector(".icon-name").value;
  let phone = document.querySelector(".icon-phone").value;
  let contact = findContactById(currentEditingId);
  await putContact({
    name,
    email: emailInput.value,
    phone,
    color: contact.color,
  });
  await finalizeAddition();
  showContactDetails(currentEditingId);
  enableButton("btn-submit-contact");
  enableButton("btn-cancel");
}

/**
 * Updates an existing contact or user in the database without losing properties.
 * @async
 * @param {Object} contact - The updated fields.
 */
async function putContact(contact) {
  let isUser = await checkIfIdIsUser(currentEditingId);
  let path = isUser
    ? `users/${currentEditingId}`
    : `contacts/${currentEditingId}`;
  let url = `https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/${path}.json`;
  if (isUser) {
    let response = await fetch(url);
    let currentDBUser = await response.json();
    Object.assign(currentDBUser, contact);
    contact = currentDBUser;
  }
  await fetch(url, { method: "PUT", body: JSON.stringify(contact) });
}
/**
 * Deletes a contact or user from the database depending on its origin.
 * @async
 * @param {string} id - Unique contact or user ID.
 */
async function deleteContact(id, event) {
  if (event) event.currentTarget.disabled = true;
  disableButtonWhileLoading("btn-submit-contact");
  disableButtonWhileLoading("btn-cancel");

  let isUser = await checkIfIdIsUser(id);
  let path = isUser ? `users/${id}` : `contacts/${id}`;
  let url = `https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/${path}.json`;
  await fetch(url, { method: "DELETE" });
  closeContactDetails();
  document.getElementById("contact-detail-content").innerHTML = "";
  await init();

  enableButton("btn-submit-contact");
  enableButton("btn-cancel");
}

/**
 * Checks if a specific ID belongs to a registered user.
 * @async
 * @param {string} id - The ID to check.
 * @returns {Promise<boolean>} True if the ID is a user.
 */
async function checkIfIdIsUser(id) {
  let response = await fetch(
    `https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/users/${id}.json`,
  );
  let data = await response.json();
  return data !== null;
}
