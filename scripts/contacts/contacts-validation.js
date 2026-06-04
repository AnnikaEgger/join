/**
 * Checks all contact fields simultaneously (essential for submitting the form).
 * @returns {boolean} - True, if all fields are valid.
 */
function isContactFormValid() {
    checkContactInputValidity('name');
    checkContactInputValidity('email');
    checkContactInputValidity('phone');

    const nameInput = document.getElementById('contact-name--validator');
    const emailInput = document.getElementById('contact-email--validator');
    const phoneInput = document.getElementById('contact-phone--validator');

    if (nameInput.classList.contains('input-error') ||
        emailInput.classList.contains('input-error') ||
        phoneInput.classList.contains('input-error')) {
        return false;
    }

    return true;
}

/**
 * 
Main function for validating the contact input fields.
 * @param {string} inputType - the type of the field ('name', 'email', 'phone')
 */
function checkContactInputValidity(inputType) {
    const input = document.getElementById(`contact-${inputType}--validator`);
    if (!input) return;

    if (inputType === 'name') {
        validateContactName(input);
    } else if (inputType === 'email') {
        validateContactEmail(input);
    } else if (inputType === 'phone') {
        validateContactPhone(input);
    }
}

/**
 * Validates the name input field and updates its error status.
 * @param {HTMLInputElement} input - The name input element.
 */
function validateContactName(input) {
    const errorSpan = document.getElementById('contact-name--error');

    if (input.value.trim() === "") {
        input.classList.add('input-error');
        if (errorSpan) errorSpan.innerText = "This field is required.";
    } else {
        input.classList.remove('input-error');
        if (errorSpan) errorSpan.innerText = "";
    }
}

/**
 * Validates the email input field structure and updates its error status.
 * @param {HTMLInputElement} input - The email input element.
 */
function validateContactEmail(input) {
    const errorSpan = document.getElementById('contact-email--error');
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (input.value.trim() === "") {
        input.classList.add('input-error');
        if (errorSpan) errorSpan.innerText = "This field is required.";
    } else if (!emailPattern.test(input.value.trim())) {
        input.classList.add('input-error');
        if (errorSpan) errorSpan.innerText = "Please enter a valid email address (e.g., user@example.com).";
    } else {
        input.classList.remove('input-error');
        if (errorSpan) errorSpan.innerText = "";
    }
}

/**
 * Validates the phone input field format and updates its error status.
 * @param {HTMLInputElement} input - The phone input element.
 */
function validateContactPhone(input) {
    const errorSpan = document.getElementById('contact-phone--error');
    let phonePattern = /^[0-9+\s\-\/]+$/;

    if (input.value.trim() === "") {
        input.classList.add('input-error');
        if (errorSpan) errorSpan.innerText = "This field is required.";
    } else if (!phonePattern.test(input.value.trim())) {
        input.classList.add('input-error');
        if (errorSpan) errorSpan.innerText = "Please enter a valid phone number (digits only).";
    } else {
        input.classList.remove('input-error');
        if (errorSpan) errorSpan.innerText = "";
    }
}

/**
* Tries to lock the screen orientation to portrait mode on mobile devices.*
* @param {*} - No parameters are required for this function as it directly interacts with the Screen Orientation API 
* to attempt to lock the orientation when the board page is initialized.
*/
function lockScreenOrientation() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("portrait-primary").catch(() => {});
  }
}