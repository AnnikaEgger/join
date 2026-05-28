const BASE_URL =
  "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";

const ICON_LOCK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`;

const ICON_EYE_OFF = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;

const ICON_EYE_ON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;

const ERROR_TO_INPUT = {
  "error-login-email": "login-email",
  "error-login-password": "login-password",
};

/**
 * Logs in as guest. Saves a guest object to localStorage and redirects.
 */
function guestLogin() {
  const guestUser = { isGuest: true, name: "Guest" };
  localStorage.setItem("currentUser", JSON.stringify(guestUser));
  window.location.href = "./html/summary.html";
}

/**
 * Initializes the login page.
 */
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", handleLogin);

  const inputs = document.querySelectorAll("#login-form input");
  inputs.forEach((input) =>
    input.addEventListener("input", clearAllLoginErrors),
  );

  initPasswordToggle();
  document
    .getElementById("login-password")
    .addEventListener("input", () =>
      updatePasswordIcon("login-password", "toggle-login-password"),
    );
}

/**
 * Clears all error messages on login.
 */
function clearAllLoginErrors() {
  clearError("error-login-email");
  clearError("error-login-password");
  clearError("error-login-general");
}

/**
 * Validates login form fields.
 * @returns {boolean}
 */
function validateLoginForm() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  return checkLoginEmail(email) & checkLoginPassword(password);
}

/**
 * Validates the login email.
 * @param {string} email
 * @returns {boolean}
 */
function checkLoginEmail(email) {
  if (email.length === 0) {
    showError("error-login-email", "Please enter your email");
    return false;
  }
  if (!email.includes("@") || !email.includes(".")) {
    showError("error-login-email", "Please enter a valid email");
    return false;
  }
  return true;
}

/**
 * Validates the login password.
 * @param {string} password
 * @returns {boolean}
 */
function checkLoginPassword(password) {
  if (password.length === 0) {
    showError("error-login-password", "Please enter your password");
    return false;
  }
  return true;
}

/**
 * Shows an error message and marks input as invalid.
 * @param {string} errorId
 * @param {string} message
 */
function showError(errorId, message) {
  document.getElementById(errorId).textContent = message;
  const inputId = ERROR_TO_INPUT[errorId];
  if (inputId) document.getElementById(inputId)?.classList.add("invalid");
}

/**
 * Clears an error message and removes invalid state.
 * @param {string} errorId
 */
function clearError(errorId) {
  document.getElementById(errorId).textContent = "";
  const inputId = ERROR_TO_INPUT[errorId];
  if (inputId) document.getElementById(inputId)?.classList.remove("invalid");
}

/**
 * Handles login submit: validates, fetches users, matches, redirects.
 * @param {Event} event
 */
async function handleLogin(event) {
  event.preventDefault();
  if (!validateLoginForm()) return;

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const users = await loadAllUsers();
  const matchedUser = findMatchingUser(email, password, users);

  if (matchedUser) {
    saveCurrentUser(matchedUser);
    window.location.href = "./html/summary.html";
  } else {
    showError("error-login-general", "Wrong email or password");
  }
}

/**
 * Loads all users from Firebase.
 * @returns {Promise<Array>}
 */
async function loadAllUsers() {
  const response = await fetch(BASE_URL + "/users.json");
  const data = await response.json();
  if (!data) return [];
  return Object.values(data);
}

/**
 * Finds a user matching email and password.
 * @param {string} email
 * @param {string} password
 * @param {Array} users
 * @param {string} id
 * @returns {Object|undefined}
 */
function findMatchingUser(email, password, users) {
  return users.find(
    (user) => user.email === email && user.password === password,
  );
}

/**
 * Saves the logged-in user to localStorage (without password).
 * @param {Object} user
 */
function saveCurrentUser(user) {
  const userData = {
    name: user.name,
    id: user.id,
    email: user.email,
    color: user.color,
  };
  localStorage.setItem("currentUser", JSON.stringify(userData));
}

/**
 * Updates the password toggle icon based on input state.
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
 * Toggles password visibility.
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
 * Initializes the login password toggle with the lock icon.
 */
function initPasswordToggle() {
  updatePasswordIcon("login-password", "toggle-login-password");
}

document.addEventListener("DOMContentLoaded", initLogin);
