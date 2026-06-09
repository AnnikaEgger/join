/**
 * @fileoverview Provides the login page logic, password visibility helpers,
 * Firebase user authentication, and shared page-protection utilities.
 * @module script
 */

/**
 * Base URL for Firebase Realtime Database requests.
 * @constant {string}
 */
const BASE_URL =
  "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Lock icon displayed when password input is empty.
 * @constant {string}
 */
const ICON_LOCK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`;

/**
 * Icon displayed when password visibility is disabled.
 * @constant {string}
 */
const ICON_EYE_OFF = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;

/**
 * Icon displayed when password visibility is enabled.
 * @constant {string}
 */
const ICON_EYE_ON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;

/**
 * Maps login error containers to their related input fields.
 * @constant {{[key: string]: string}}
 */
const ERROR_TO_INPUT = {
  "error-login-email": "login-email",
  "error-login-password": "login-password",
};

/**
 * Logs in as guest and redirects to the summary page.
 */
function guestLogin() {
  const guestUser = { isGuest: true, name: "Guest" };
  localStorage.setItem("currentUser", JSON.stringify(guestUser));
  window.location.href = "./html/summary.html";
}

/**
 * Initializes login page handlers and UI state.
 */
function initLogin() {
  initSplash();
  const form = document.getElementById("login-form");
  if (!form) return;

  initPasswordToggle();
}

/**
 * Revalidates a login field and refreshes the password toggle state.
 * @param {string} inputId - The login input name suffix to validate.
 */
function checkInputValidityOnInputLogin(inputId) {
  initPasswordToggle();

  const input = document.getElementById("login" + "-" + inputId);

  if (input.checkValidity()) {
    removeInvalidStyle(input);
  }
}

/**
 * Marks an invalid login field when the user leaves it.
 * @param {string} inputId - The login input name suffix to validate.
 */
function checkInputValidityOnBlurLogin(inputId) {
  const input = document.getElementById("login" + "-" + inputId);

  if (!input.checkValidity()) {
    removeGeneralError();
    addInvalidStyle(input);
  }
}

/**
 * Removes the invalid styling from a form field.
 * @param {HTMLElement} element - The input element to reset.
 */
function removeInvalidStyle(element) {
  element.classList.remove("invalid");
  element.closest(".required").classList.remove("login-after");
}

/**
 * Adds invalid styling to a form field and its wrapper.
 * @param {HTMLElement} element - The invalid input element.
 */
function addInvalidStyle(element) {
  element.classList.add("invalid");
  element.closest(".required").classList.add("login-after");
}

/**
 * Displays the global login error banner for invalid credentials.
 */
function showGeneralError() {
  document
    .getElementById("input-required-container")
    .classList.add("login-container-after");
}

/**
 * Hides the global login error banner.
 */
function removeGeneralError() {
  document
    .getElementById("input-required-container")
    .classList.remove("login-container-after");
}

/**
 * Handles the login form submission and redirects the user on success.
 * @param {Event} event - The submit event triggered by the login form.
 * @returns {Promise<void>} Resolves after authentication and redirection logic completes.
 */
async function handleLogin(event) {
  event.preventDefault();
  const LOGIN_FORM = document.getElementById("login-form");

  if (!LOGIN_FORM.checkValidity()) {
    handleInvalidTaskform(LOGIN_FORM);
    return;
  }

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const users = await loadAllUsers();
  const matchedUser = findMatchingUser(email, password, users);

  if (matchedUser) {
    saveCurrentUser(matchedUser);
    window.location.href = "./html/summary.html";
  } else {
    showGeneralError();
  }
}

/**
 * Adds validation feedback to all invalid form fields.
 * @param {HTMLFormElement} taskForm - The form to validate.
 */
function handleInvalidTaskform(taskForm) {
  const invalidElements = taskForm.querySelectorAll(":invalid");

  if (!invalidElements.length) return;

  invalidElements.forEach((element) => {
    addInvalidStyle(element);
  });

  const firstInvalid = invalidElements[0];
  if (firstInvalid) focusInvalidElement(firstInvalid);
}

/**
 * Focuses the first invalid field and scrolls it into view.
 * @param {HTMLElement} element - The invalid form element to focus.
 */
function focusInvalidElement(element) {
  element.focus();

  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}
/**
 * Loads all users from Firebase.
 * @returns {Promise<Array<Object>>}
 */
async function loadAllUsers() {
  const response = await fetch(BASE_URL + "users.json");
  const data = await response.json();
  if (!data) return [];
  return Object.values(data);
}

/**
 * Finds a user matching the given email and password.
 * @param {string} email
 * @param {string} password
 * @param {Array<Object>} users
 * @returns {Object|undefined}
 */
function findMatchingUser(email, password, users) {
  return users.find(
    (user) => user.email === email && user.password === password,
  );
}

/**
 * Saves the authenticated user profile to localStorage.
 * @param {Object} user
 */
function saveCurrentUser(user) {
  const userData = {
    name: user.name,
    id: user.id,
    email: user.email,
    phone: "",
    color: user.color,
  };
  localStorage.setItem("currentUser", JSON.stringify(userData));
}

/**
 * Updates the password toggle icon according to input state.
 * @param {string} inputId
 * @param {string} toggleId
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
 * Toggles password visibility for the specified input.
 * @param {string} inputId
 * @param {string} toggleId
 */
function togglePassword(inputId, toggleId) {
  const input = document.getElementById(inputId);
  if (input.value === "") return;
  input.type = input.type === "password" ? "text" : "password";
  updatePasswordIcon(inputId, toggleId);
}

/**
 * Initializes the login password toggle icon.
 */
function initPasswordToggle() {
  updatePasswordIcon("login-password", "toggle-login-password");
}
/**
 * Runs the splash animation once per session.
 */
function initSplash() {
  const overlay = document.getElementById("splash-overlay");
  if (!overlay) return;

  if (sessionStorage.getItem("splashShown")) {
    overlay.style.display = "none";
    return;
  }

  sessionStorage.setItem("splashShown", "true");
  overlay.classList.add("splash-active");
  setTimeout(() => overlay.classList.add("splash-done"), 2200);
}
document.addEventListener("DOMContentLoaded", initLogin);

/**
 * Enables pointer interaction for a named UI panel.
 * @param {string} id
 */
function enableAllPointerEvents(id) {
  let elementId;

  if (id === "--add-task") {
    elementId = "body--add-task";
  } else if (id === "--add-task-dialog") {
    elementId = "content-wrapper--add-task-dialog";
  } else if (id === "--board") {
    elementId = "body--board";
  } else if (id === "taskDialog") {
    elementId = "content-wrapper--task-dialog";
  } else if (id === "--contacts") {
    elementId = "body--contacts";
  }

  const element = document.getElementById(elementId);
  element.classList.remove("disabled-ui");
}

/**
 * Disables a button while a loading action is in progress.
 * @param {string} buttonId
 */
function disableButtonWhileLoading(buttonId) {
  let button = document.getElementById(buttonId);
  button.disabled = true;
}

/**
 * Enables a button that was previously disabled.
 * @param {string} buttonId
 */
function enableButton(buttonId) {
  let button = document.getElementById(buttonId);
  button.disabled = false;
}

/**
 * Tries to lock the screen orientation to portrait mode on mobile devices.
 */
function lockScreenOrientation() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("portrait-primary").catch(() => {});
  }
}

/**
 * Page Protection: Checks upon page load whether a user exists
 * in localStorage. If not, redirects to the login page.
 * Executed automatically as an IIFE during script load.
 */
function guardPage() {
  const stored = localStorage.getItem("currentUser");

  if (!stored) {
    window.location.href = "../index.html";
    return;
  }

  try {
    JSON.parse(stored);
  } catch (e) {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
  }
}

/**
 * Initializes page protection for help, privacy policy, and legal notice pages.
 */
function initHelpPrivacyPolicyLegalNotice() {
  guardPage();
}
