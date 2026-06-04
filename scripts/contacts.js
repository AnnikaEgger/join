const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/.json";
let contacts = [];
let currentEditingId = null;

/**
 * Initializes the application by loading and rendering contacts.
 * @async
 * @returns {Promise<void>}
 */
async function init() {
    await loadContacts();
    renderContactList();
}

/**
 * Loads contacts from the database and sorts them alphabetically.
 * @async
 * @returns {Promise<void>}
 */
async function loadContacts() {
    contacts = [];
    let response = await fetch(BASE_URL);
    let data = await response.json();

    if (data && data.contacts) {
        fillContactsArray(data.contacts);
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
        let contactData = contactsObj[id];
        contactData.id = id;
        contacts.push(contactData);
    }
}

/**
 * Renders the grouped contact list into the DOM.
 */
function renderContactList() {
    let content = document.getElementById('contact-list');
    content.innerHTML = '';
    let currentLetter = '';

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
 * Resets the detail view class to prepare for the slide-in animation.
 */
function prepareDetailsAnimation() {
    let view = document.getElementById('contact-detail-view');
    view.classList.remove('show-detail');
}

/**
 * Renders the detailed HTML view of a contact.
 * @param {Object} contact - The contact object.
 */
function renderDetails(contact) {
    let content = document.getElementById('contact-detail-content');
    content.innerHTML = generateDetailHTML(contact);
}

/**
 * Triggers the slide-in animation for the detail view.
 */
function startDetailsAnimation() {
    setTimeout(() => {
        let view = document.getElementById('contact-detail-view');
        view.classList.add('show-detail');
        setTimeout(focusBackButton, 100);
    }, 50);
}

/**
 * Toggles the visibility of the mobile action menu.
 */
function toggleMobileMenu() {
    let menu = document.getElementById('mobile-menu-container');
    if (menu) {
        menu.classList.toggle('show-menu');
        if (menu.classList.contains('show-menu')) {
            delayMenuFocus();
        }
    }
}

/**
 * Highlights the selected contact card in the list.
 * @param {string} id - Unique contact ID.
 */
function highlightContact(id) {
    let allCards = document.getElementsByClassName('contact-item');
    for (let i = 0; i < allCards.length; i++) {
        allCards[i].classList.remove('contact-item-active');
    }

    let activeCard = document.getElementById(`card-${id}`);
    if (activeCard) {
        activeCard.classList.add('contact-item-active');
    }
}

/**
 * Closes the contact detail view.
 */
function closeContactDetails() {
    let detailView = document.getElementById('contact-detail-view');
    detailView.classList.remove('show-detail');
}

/**
 * Validates, creates, saves, and displays a new contact.
 * @async
 * @returns {Promise<void>}
 */
async function createNewContact() {
    if (!isContactFormValid()) {
        return;
    }

    let name = document.querySelector('.icon-name').value;
    let email = document.querySelector('.icon-mail').value;
    let phone = document.querySelector('.icon-phone').value;
    let color = getRandomColor();

    let newContact = { name, email, phone, color };

    let newId = await postContact(newContact);
    await finalizeAddition();

    showContactDetails(newId);
    showSuccessBanner();
}

/**
 * Saves a new contact to the database.
 * @async
 * @param {Object} contact - The contact data object.
 * @returns {Promise<string>} The generated database ID.
 */
async function postContact(contact) {
    let url = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
    let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    });

    let data = await response.json();
    return data.name;
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
    document.querySelector('.contact-form').reset();

    const fields = ['name', 'email', 'phone'];
    for (let i = 0; i < fields.length; i++) {
        let input = document.getElementById(`contact-${fields[i]}--validator`);
        let errorSpan = document.getElementById(`contact-${fields[i]}--error`);

        if (input) input.classList.remove('input-error');
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
 * Sets the dialog avatar color and initials based on the contact.
 * @param {Object} contact - The contact object.
 */
function updateDialogAvatar(contact) {
    let avatarContainer = document.querySelector('.default-avatar');
    let initials = getInitials(contact.name);
    avatarContainer.style.backgroundColor = contact.color;
    avatarContainer.innerHTML = initials;
}

/**
 * Resets the dialog avatar to the default placeholder.
 */
function resetDialogAvatar() {
    let avatarContainer = document.querySelector('.default-avatar');
    avatarContainer.style.backgroundColor = '#D1D1D1';
    avatarContainer.innerHTML = `<img src="../assets/icons/person-white.svg" alt="Avatar" />`;
}

/**
 * Fills the form input fields with contact data.
 * @param {Object} contact - The contact object.
 */
function fillFormFields(contact) {
    document.querySelector('.icon-name').value = contact.name;
    document.querySelector('.icon-mail').value = contact.email;
    document.querySelector('.icon-phone').value = contact.phone;
}

/**
 * Changes the dialog texts and submit behavior for editing a contact.
 * @param {string} id - Unique contact ID.
 */
function adaptDialogForEdit(id) {
    document.querySelector('.dialog-left h1').innerHTML = 'Edit Contact';

    let btnCreate = document.querySelector('.btn-create');
    btnCreate.innerHTML = `Save <img src="../assets/icons/check.svg" alt="Save">`;

    document.querySelector('.contact-form').onsubmit = function () {
        saveEditedContact();
        return false;
    }

    adaptCancelButtonToDelete(id);
}

/**
 * Changes the form cancel button into a delete button.
 * @param {string} id - Unique contact ID.
 */
function adaptCancelButtonToDelete(id) {
    let cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.innerHTML = `Delete`;
        cancelBtn.onclick = async function () {
            await deleteContact(id);
            closeContactDialog();
        };
    }
}
/**
 * Opens the contact dialog modal.
 */
function openContactDialog() {
    const dialog = document.getElementById('add-contact-dialog');
    if (dialog) {
        dialog.showModal();
    }
    focusActiveCloseButton();
}

/**
 * Closes the contact dialog modal.
 */
function closeContactDialog() {
    const dialog = document.getElementById('add-contact-dialog');
    if (dialog) {
        dialog.close();
    }
    resetCancelButton(); 
}

/**
 * Closes the dialog if a click occurs outside of it (on the backdrop).
 * @param {MouseEvent} event - The click event.
 */
function closeContactDialogOutside(event) {
    const dialog = document.getElementById('add-contact-dialog');
    if (event.target === dialog) {
        closeContactDialog();
    }
}

/**
 * Prepares and opens the dialog for creating a new contact.
 */
function prepareAddContactDialog() {
    currentEditingId = null;
    resetForm();
    resetDialogAvatar();

    document.querySelector('.dialog-left h1').innerHTML = "Add contact";

    let btnCreate = document.querySelector('.btn-create');
    btnCreate.innerHTML = `Create contact <img src="../assets/icons/check.svg" alt="Check">`;

    document.querySelector('.contact-form').onsubmit = function () {
        createNewContact();
        return false;
    }

    resetCancelButton();
    openContactDialog();
}

/**
 * Resets the dialog cancel button to its default behavior.
 */
function resetCancelButton() {
    let btnCancel = document.querySelector('.btn-cancel');
    if (btnCancel) {
        btnCancel.innerHTML = `Cancel <img src="../assets/icons/close-icon.svg" alt="X" />`;
        btnCancel.onclick = closeContactDialog; 
    }
}
/**
 * Validates and saves changes made to an edited contact.
 * @async
 * @returns {Promise<void>}
 */
async function saveEditedContact() {
    if (!isContactFormValid()) {
        return;
    }

    let name = document.querySelector('.icon-name').value;
    let email = document.querySelector('.icon-mail').value;
    let phone = document.querySelector('.icon-phone').value;
    let contact = findContactById(currentEditingId);

    let updatedContact = { name, email, phone, color: contact.color };

    await putContact(updatedContact);
    await finalizeAddition();
    showContactDetails(currentEditingId);
}

/**
 * Updates an existing contact in the database.
 * @async
 * @param {Object} contact - The updated contact data.
 * @returns {Promise<void>}
 */
async function putContact(contact) {
    let url = `https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/contacts/${currentEditingId}.json`;
    await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    });
}

/**
 * Deletes a contact from the database by its ID.
 * @async
 * @param {string} id - Unique contact ID.
 * @returns {Promise<void>}
 */
async function deleteContact(id) {
    let url = `https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/contacts/${id}.json`;

    await fetch(url, {
        method: "DELETE"
    });

    closeContactDetails();

    document.getElementById('contact-detail-content').innerHTML = '';
    await init();
}