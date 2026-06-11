const BASE_URL =
  "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";

const AVATAR_COLORS = [
  "#FF7A00", "#1FD7C1", "#462F8A", "#9327FF",
  "#FF5EB3", "#FCBE2D", "#6E52FF", "#FF4646",
];

const ICON_LOCK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`;
const ICON_EYE_OFF = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7 l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;
const ICON_EYE_ON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;

/**
 * Initializes the sign-up page.
 * @returns {void}
 */
function initSignup() {
  initPasswordToggles();
}

/**
 * Collects all sign-up form data into a user object.
 * @returns {Object} The user payload to save to Firebase.
 */
function collectFormData() {
  return {
    name: document.getElementById("signup-name").value.trim(),
    id: "user",
    email: document.getElementById("signup-email").value.trim(),
    password: document.getElementById("signup-password").value,
    color: getRandomColor(),
  };
}

/**
 * Returns a random avatar color from the pool.
 * @returns {string} A randomly selected avatar color.
 */
function getRandomColor() {
  const index = Math.floor(Math.random() * AVATAR_COLORS.length);
  return AVATAR_COLORS[index];
}

/**
 * Checks whether an email address already exists in Firebase.
 * @param {string} email - The email to validate.
 * @returns {Promise<boolean>} True when the email is already registered.
 */
async function checkEmailExists(email) {
  const response = await fetch(BASE_URL + "/users.json");
  const data = await response.json();
  if (!data) return false;
  const users = Object.values(data);
  return users.some((user) => user.email === email);
}

/**
 * Saves a new user to Firebase.
 * @param {Object} user - The user payload to store.
 * @returns {Promise<void>} Resolves when the save request finishes.
 */
async function saveUser(user) {
  await fetch(BASE_URL + "/users.json", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

/**
 * Shows the success toast after a successful sign-up.
 * @returns {void}
 */
function showSuccessToast() {
  document.getElementById("success-toast").classList.add("show");
}

/**
 * Updates the password toggle icon based on input state.
 * @param {string} inputId - The password input element ID.
 * @param {string} toggleId - The toggle button element ID.
 * @returns {void}
 */
function updatePasswordIcon(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (input.value === "") {
    toggle.innerHTML = ICON_LOCK;
    toggle.classList.add("non-clickable");
    return;
  }
  toggle.classList.remove("non-clickable");
  toggle.innerHTML = input.type === "password" ? ICON_EYE_OFF : ICON_EYE_ON;
}

/**
 * Toggles password visibility.
 * @param {string} inputId - The password input element ID.
 * @param {string} toggleId - The toggle button element ID.
 * @returns {void}
 */
function togglePassword(inputId, toggleId) {
  const input = document.getElementById(inputId);
  if (input.value === "") return;
  input.type = input.type === "password" ? "text" : "password";
  updatePasswordIcon(inputId, toggleId);
}

/**
 * Initializes both password toggles with the lock icon.
 * @returns {void}
 */
function initPasswordToggles() {
  updatePasswordIcon("signup-password", "toggle-password");
  updatePasswordIcon("signup-confirm-password", "toggle-confirm");
}

/**
 * Revalidates a sign-up field and updates UI feedback while typing.
 * @param {string} inputId - The input name suffix to validate.
 * @returns {Promise<void>} Resolves after validation and UI updates are handled.
 */
async function checkInputValidityOnInput(inputId) {
  initPasswordToggles();
  const input = document.getElementById("signup" + "-" + inputId);
  if (!input.checkValidity() && inputId === "email") {
    await validateSignupEmail();
  }
  await handleValidOrInvalidStyles(input, inputId);
}

/**
 * Applies visual validation styling to the active sign-up field.
 * @param {HTMLInputElement|HTMLTextAreaElement} input - The input element to style.
 * @param {string} inputId - The input identifier suffix.
 * @returns {Promise<void>} Resolves after the validation state is updated.
 */
async function handleValidOrInvalidStyles(input, inputId) {
  if (input.type === "checkbox") {
    input.checkValidity() ? handleValidCheckbox() : handleInvalidCheckbox();
    return;
  }
  if (input.checkValidity()) {
    const isEmailValid = inputId === "email" ? await validateSignupEmail() : true;
    const isPassValid = inputId === "confirm-password" ? checkConfirmPassword() : true;
    if (isEmailValid && isPassValid) removeInvalidStyle(input);
  }
}

/**
 * Validates a sign-up field when the input loses focus.
 * @param {string} inputId - The input name suffix to validate.
 * @returns {Promise<void>} Resolves after blur-time validation is complete.
 */
async function checkInputValidityOnBlur(inputId) {
  const input = document.getElementById(`signup-${inputId}`);
  if (!input) return;
  let isValid = input.checkValidity();
  if (isValid && inputId === "email") isValid = await validateSignupEmail();
  if (isValid && inputId === "confirm-password") isValid = checkConfirmPassword();
  if (!isValid && inputId === "email") await validateSignupEmail();
  if (!isValid) addInvalidStyle(input);
}

/**
 * Removes the invalid state from a sign-up input.
 * @param {HTMLElement} element - The input element to reset.
 * @returns {void}
 */
function removeInvalidStyle(element) {
  element.classList.remove("invalid");
  element.closest(".required").classList.remove("signup-after");
}

/**
 * Adds the invalid state to a sign-up input and its wrapper.
 * @param {HTMLElement} element - The input element to mark invalid.
 * @returns {void}
 */
function addInvalidStyle(element) {
  element.classList.add("invalid");
  element.closest(".required").classList.add("signup-after");
}

/**
 * Handles the sign-up form submission flow.
 * @param {Event} event - The submit event from the sign-up form.
 * @returns {Promise<void>} Resolves after the sign-up flow is handled.
 */
async function submitSignupForm(event) {
  event.preventDefault();
  const taskForm = document.getElementById("signup-form");
  if (!taskForm.checkValidity()) return handleInvalidTaskform(taskForm);
  if (!checkConfirmPassword()) {
    handleInvalidSubmit(document.getElementById("signup-confirm-password"));
    return;
  }
  if (!(await validateSignupEmail())) return;
  document.getElementById("signup-btn").disabled = true;
  document.activeElement.blur();
  await finishSignup();
}

/**
 * Checks whether the entered email address already exists in Firebase.
 * @returns {Promise<boolean>} True if the email is valid and not already used.
 */
async function validateSignupEmail() {
  const userData = collectFormData();
  const emailExists = await checkEmailExists(userData.email);
  const mailWrapper = document.getElementById("input-wrapper--signup-mail");
  mailWrapper.dataset.message = emailExists ? "Email already exists" : "Please enter a valid email";
  return !emailExists;
}

/**
 * Completes the sign-up process by saving the user and showing success feedback.
 * @returns {Promise<void>} Resolves after the user is saved and the redirect is scheduled.
 */
async function finishSignup() {
  const userData = collectFormData();
  await saveUser(userData);
  showSuccessToast();
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 2000);
}

/**
 * Validates that the password and confirm password fields match.
 * @returns {boolean} True if both passwords are identical.
 */
function checkConfirmPassword() {
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm-password").value;
  if (confirm.trim().length == 0) return false;
  return password === confirm;
}

/**
 * Marks the privacy checkbox as invalid.
 * @returns {void}
 */
function handleInvalidCheckbox() {
  document
    .getElementById("signup-checkbox-container")
    .classList.add("signup-checkbox-after");
}

/**
 * Clears the invalid checkbox styling after the user makes a valid selection.
 * @returns {void}
 */
function handleValidCheckbox() {
  document
    .getElementById("signup-checkbox-container")
    .classList.remove("signup-checkbox-after");
}

/**
 * Marks invalid sign-up form elements and scrolls to the first invalid field.
 * @param {HTMLFormElement} taskForm - The sign-up form element.
 * @returns {void}
 */
function handleInvalidTaskform(taskForm) {
  const invalidElements = taskForm.querySelectorAll(":invalid");
  if (!invalidElements.length) return;
  invalidElements.forEach((el) => {
    el.type === "checkbox" ? handleInvalidCheckbox() : addInvalidStyle(el);
  });
  const firstInvalid = taskForm.querySelectorAll(".invalid")[0];
  if (firstInvalid) focusInvalidElement(firstInvalid);
}

/**
 * Focuses an invalid element and scrolls it into view.
 * @param {HTMLElement} element - The element to focus and scroll to.
 * @returns {void}
 */
function focusInvalidElement(element) {
  element.focus();
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}