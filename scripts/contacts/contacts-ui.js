/**
 * Toggles the visibility of the mobile action menu.
 * @returns {void}
 */
function toggleMobileMenu() {
  let menu = document.getElementById("mobile-menu-container");
  if (menu) {
    menu.classList.toggle("show-menu");
    if (menu.classList.contains("show-menu")) {
      delayMenuFocus();
    }
  }
}

/**
 * Resets the detail view class to prepare for the slide-in animation.
 * @returns {void}
 */
function prepareDetailsAnimation() {
  let view = document.getElementById("contact-detail-view");
  view.classList.remove("show-detail");
}

/**
 * Renders the detailed HTML view of a contact.
 * @param {Object} contact - The contact object.
 * @returns {void}
 */
function renderDetails(contact) {
  let content = document.getElementById("contact-detail-content");
  let initials = getInitials(contact.name);
  content.innerHTML = generateDetailHTML(contact, initials);
}

/**
 * Triggers the slide-in animation for the detail view.
 * @returns {void}
 */
function startDetailsAnimation() {
  setTimeout(() => {
    let view = document.getElementById("contact-detail-view");
    view.classList.add("show-detail");
    setTimeout(focusBackButton, 100);
  }, 50);
}

/**
 * Highlights the selected contact card in the list.
 * @param {string} id - Unique contact ID.
 * @returns {void}
 */
function highlightContact(id) {
  let allCards = document.getElementsByClassName("contact-item");
  for (let i = 0; i < allCards.length; i++) {
    allCards[i].classList.remove("contact-item-active");
  }
  let activeCard = document.getElementById(`card-${id}`);
  if (activeCard) {
    activeCard.classList.add("contact-item-active");
  }
}

/**
 * Closes the contact detail view.
 * @returns {void}
 */
function closeContactDetails() {
  let detailView = document.getElementById("contact-detail-view");
  detailView.classList.remove("show-detail");
}

/**
 * Sets the dialog avatar color and initials based on the contact.
 * @param {Object} contact - The contact object.
 * @returns {void}
 */
function updateDialogAvatar(contact) {
  let avatarContainer = document.querySelector(".default-avatar");
  let initials = getInitials(contact.name);
  avatarContainer.style.backgroundColor = contact.color;
  avatarContainer.innerHTML = initials;
}

/**
 * Resets the dialog avatar to the default placeholder.
 * @return {void}
 */
function resetDialogAvatar() {
  let avatarContainer = document.querySelector(".default-avatar");
  avatarContainer.style.backgroundColor = "#D1D1D1";
  avatarContainer.innerHTML = `<img src="../assets/icons/person-white.svg" alt="Avatar" />`;
}

/**
 * Fills the form input fields with contact data.
 * @param {Object} contact - The contact object.
 * @return {void}
 */
function fillFormFields(contact) {
  document.querySelector(".icon-name").value = contact.name;
  document.querySelector(".icon-mail").value = contact.email;
  document.querySelector(".icon-phone").value = contact.phone || "";
}

/**
 * Changes the dialog texts and submit behavior for editing a contact.
 * @param {string} id - Unique contact ID.
 * @return {void}
 */
function adaptDialogForEdit(id) {
  document.querySelector(".dialog-left h2").innerHTML = "Edit Contact";
  const subtitle = document.getElementById("dialog-subtitle");
  if (subtitle) subtitle.classList.add("d-none");
  let btnCreate = document.querySelector(".btn-create");
  btnCreate.innerHTML = `Save <img src="../assets/icons/check.svg" alt="Save">`;
  document.querySelector(".contact-form").onsubmit = function () {
    saveEditedContact();
    return false;
  };
  adaptCancelButtonToDelete(id);
}

/**
 * Changes the form cancel button into a delete button.
 * @param {string} id - Unique contact ID.
 * @returns {void}
 */
function adaptCancelButtonToDelete(id) {
  let cancelBtn = document.querySelector(".btn-cancel");
  if (cancelBtn) {
    cancelBtn.innerHTML = `Delete`;
    cancelBtn.onclick = async function (event) {
      await deleteContact(id, event);
      closeContactDialog();
    };
  }
}

/**
 * Opens the contact dialog modal.
 * @returns {void}
 */
function openContactDialog() {
  const dialog = document.getElementById("add-contact-dialog");
  if (dialog) {
    dialog.showModal();
  }
  focusActiveCloseButton();
}

/**
 * Closes the contact dialog modal with a slide-out animation.
 * @returns {void}
 */
function closeContactDialog() {
  const dialog = document.getElementById("add-contact-dialog");
  if (dialog) {
    dialog.classList.add("hide-dialog");
    setTimeout(() => {
      dialog.close();
      dialog.classList.remove("hide-dialog");
      resetForm();
      resetCancelButton();
    }, 125);
  }
}

/**
 * Closes the dialog if a click occurs outside of it (on the backdrop).
 * @param {MouseEvent} event - The click event.
 * @return {void}
 */
function closeContactDialogOutside(event) {
  const dialog = document.getElementById("add-contact-dialog");
  if (event.target === dialog) {
    closeContactDialog();
  }
}

/**
 * Resets the dialog cancel button to its default behavior.
 * @returns {void}
 */
function resetCancelButton() {
  let btnCancel = document.querySelector(".btn-cancel");
  if (btnCancel) {
    btnCancel.innerHTML = `Cancel <img src="../assets/icons/close-icon.svg" alt="X" />`;
    btnCancel.onclick = closeContactDialog;
  }
}