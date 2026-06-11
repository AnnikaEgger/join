/**
 * Checks input validity while typing. Removes error styles if the field becomes valid.
 * @param {string} inputId - 'name', 'email', or 'phone'
 * @return {void}
 */
function checkContactInputValidityOnInput(inputId) {
  const input = document.getElementById(`contact-${inputId}--validator`);
  if (input && input.checkValidity()) {
    removeInvalidStyle(input);
  }
}

/**
 * Checks input validity when focus is lost. Adds error styles if the field is invalid.
 * @param {string} inputId - 'name', 'email', or 'phone'
 * @return {void}
 */
function checkContactInputValidityOnBlur(inputId) {
  const input = document.getElementById(`contact-${inputId}--validator`);
  if (input && !input.checkValidity()) {
    addInvalidStyle(input);
  }
}

/**
 * Removes the invalid style from an input field and hides its error message.
 * @param {HTMLInputElement} element - The input element to clear errors from.
 * @return {void}
 */
function removeInvalidStyle(element) {
  element.classList.remove("invalid");
  element.closest(".required").classList.remove("signup-after");
}

/**
 * Adds the invalid style to an input field and displays its error message.
 * @param {HTMLInputElement} element - The input element to mark as invalid.
 * @return {void}
 */
function addInvalidStyle(element) {
  element.classList.add("invalid");
  element.closest(".required").classList.add("signup-after");
}

/**
 * Checks all fields on form submission.
 * @returns {boolean} - True if the entire form is valid.
 */
function isContactFormValid() {
  const fields = ['name', 'email', 'phone'];
  for (let i = 0; i < fields.length; i++) {
    const input = document.getElementById(`contact-${fields[i]}--validator`);
    if (input && !input.checkValidity()) {
      addInvalidStyle(input);
    }
  }
  const errors = document.querySelectorAll('.add-contact-dialog .signup-after');
  return errors.length === 0;
}