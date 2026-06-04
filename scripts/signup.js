const BASE_URL =
  "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";

const AVATAR_COLORS = [
  "#FF7A00",
  "#1FD7C1",
  "#462F8A",
  "#9327FF",
  "#FF5EB3",
  "#FCBE2D",
  "#6E52FF",
  "#FF4646",
];

const ICON_LOCK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`;

const ICON_EYE_OFF = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;

const ICON_EYE_ON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#a8a8a8"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;

const ERROR_TO_INPUT = {
  "error-name": "signup-name",
  "error-email": "signup-email",
  "error-password": "signup-password",
  "error-confirm": "signup-confirm-password",
};

/**
 * Initializes the sign-up page.
 */
function initSignup() {
  const inputs = document.querySelectorAll("#signup-form input");
  inputs.forEach((input) => input.addEventListener("input", validateForm));

  document
    .getElementById("signup-form")
    .addEventListener("submit", handleSignup);

  initPasswordToggles();
  document
    .getElementById("signup-password")
    .addEventListener("input", () =>
      updatePasswordIcon("signup-password", "toggle-password"),
    );
  document
    .getElementById("signup-confirm-password")
    .addEventListener("input", () =>
      updatePasswordIcon("signup-confirm-password", "toggle-confirm"),
    );
}

/**
 * Validates all fields and enables/disables submit button.
 */
function validateForm() {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm-password").value;
  const checkbox = document.getElementById("signup-checkbox").checked;

  const isValid =
    checkName(name) &&
    checkEmail(email) &&
    checkPassword(password) &&
    checkConfirmPassword(password, confirm) &&
    checkbox;

  document.getElementById("signup-btn").disabled = !isValid;
}

/**
 * Validates the name field.
 * @param {string} name
 * @returns {boolean}
 */
function checkName(name) {
  if (name.length === 0) {
    clearError("error-name");
    return false;
  }
  clearError("error-name");
  return true;
}

/**
 * Validates the email field.
 * @param {string} email
 * @returns {boolean}
 */
function checkEmail(email) {
  if (email.length === 0) {
    clearError("error-email");
    return false;
  }
  if (!email.includes("@") || !email.includes(".")) {
    showError("error-email", "Please enter a valid email");
    return false;
  }
  clearError("error-email");
  return true;
}

/**
 * Validates the password field (min 6 characters).
 * @param {string} password
 * @returns {boolean}
 */
function checkPassword(password) {
  if (password.length === 0) {
    clearError("error-password");
    return false;
  }
  if (password.length < 6) {
    showError("error-password", "Password must be at least 6 characters");
    return false;
  }
  clearError("error-password");
  return true;
}

/**
 * Validates that both passwords match.
 * @param {string} password
 * @param {string} confirm
 * @returns {boolean}
 */
function checkConfirmPassword(password, confirm) {
  if (confirm.length === 0) {
    clearError("error-confirm");
    return false;
  }
  if (password !== confirm) {
    showError("error-confirm", "Passwords do not match");
    return false;
  }
  clearError("error-confirm");
  return true;
}

/**
 * Shows an error message and marks the input as invalid.
 * @param {string} errorId
 * @param {string} message
 */
function showError(errorId, message) {
  document.getElementById(errorId).textContent = message;
  const inputId = ERROR_TO_INPUT[errorId];
  if (inputId) document.getElementById(inputId)?.classList.add("invalid");
}

/**
 * Clears the error message and removes invalid state.
 * @param {string} errorId
 */
function clearError(errorId) {
  document.getElementById(errorId).textContent = "";
  const inputId = ERROR_TO_INPUT[errorId];
  if (inputId) document.getElementById(inputId)?.classList.remove("invalid");
}

/**
 * Handles submit: checks duplicate email, saves user, shows toast.
 * @param {Event} event
 */
async function handleSignup(event) {
  event.preventDefault();
  document.getElementById("signup-btn").disabled = true;

  const userData = collectFormData();

  const emailExists = await checkEmailExists(userData.email);
  if (emailExists) {
    showError("error-email", "Email already exists");
    document.getElementById("signup-btn").disabled = false;
    return;
  }

 await saveUser(userData);
  loginAfterSignup(userData);
  showSuccessToast();
  setTimeout(() => {
    window.location.href = "../html/summary.html";
  }, 2000);
}
/**
 * Logs the user in after sign-up by saving to localStorage (without password).
 * @param {Object} user
 */
function loginAfterSignup(user) {
  const userData = {
    name: user.name,
    email: user.email,
    color: user.color,
  };
  localStorage.setItem("currentUser", JSON.stringify(userData));
}

/**
 * Collects all form data into a user object.
 * @returns {Object}
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
 * @returns {string}
 */
function getRandomColor() {
  const index = Math.floor(Math.random() * AVATAR_COLORS.length);
  return AVATAR_COLORS[index];
}

/**
 * Checks if an email already exists in Firebase.
 * @param {string} email
 * @returns {Promise<boolean>}
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
 * @param {Object} user
 */
async function saveUser(user) {
  await fetch(BASE_URL + "/users.json", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

/**
 * Shows the success toast.
 */
function showSuccessToast() {
  document.getElementById("success-toast").classList.add("show");
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
 * Initializes both password toggles with the lock icon.
 */
function initPasswordToggles() {
  updatePasswordIcon("signup-password", "toggle-password");
  updatePasswordIcon("signup-confirm-password", "toggle-confirm");
}

document.addEventListener("DOMContentLoaded", initSignup);
