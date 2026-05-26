const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Logs the user in as a guest.
 * Stores a guest object in localStorage and redirects to the summary page.
 */
function guestLogin() {
    const guestUser = {
        isGuest: true,
        name: "Guest"
    };

    localStorage.setItem("currentUser", JSON.stringify(guestUser));
    window.location.href = "./html/summary.html";
}


/**
 * Initializes the login page.
 * Attaches event listeners to the inputs and the submit button.
 */
function initLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", handleLogin);

    const inputs = document.querySelectorAll("#login-form input");
    inputs.forEach(input => {
        input.addEventListener("input", clearAllLoginErrors);
    });
}


/**
 * Clears all error messages on the login page.
 */
function clearAllLoginErrors() {
    clearError("error-login-email");
    clearError("error-login-password");
    clearError("error-login-general");
}


/**
 * Validates the login form fields.
 * @returns {boolean} True if both fields are valid.
 */
function validateLoginForm() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const emailValid = checkLoginEmail(email);
    const passwordValid = checkLoginPassword(password);

    return emailValid && passwordValid;
}


/**
 * Validates the format of the login email.
 * @param {string} email - The entered email address.
 * @returns {boolean} True if the email format is valid.
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
 * @param {string} password - The entered password.
 * @returns {boolean} True if the password is not empty.
 */
function checkLoginPassword(password) {
    if (password.length === 0) {
        showError("error-login-password", "Please enter your password");
        return false;
    }
    return true;
}


/**
 * Displays an error message below the input field.
 * @param {string} errorId - The ID of the error span element.
 * @param {string} message - The text message to display.
 */
function showError(errorId, message) {
    document.getElementById(errorId).textContent = message;
}


/**
 * Removes a specific error message.
 * @param {string} errorId - The ID of the error span element.
 */
function clearError(errorId) {
    document.getElementById(errorId).textContent = "";
}


/**
 * Handles the login form submission: validates inputs, loads users from Firebase,
 * matches the email and password, and redirects to the summary page upon success.
 * @param {Event} event - The submit event from the form.
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
 * @returns {Promise<Array>} A promise that resolves to an array of all users or an empty array.
 */
async function loadAllUsers() {
    const response = await fetch(BASE_URL + "/users.json");
    const data = await response.json();
    if (!data) return [];
    return Object.values(data);
}


/**
 * Searches for a user with a matching email and password.
 * @param {string} email - The entered email address.
 * @param {string} password - The entered password.
 * @param {Array} users - The array containing all users.
 * @returns {Object|undefined} The matched user object, or undefined if no match is found.
 */
function findMatchingUser(email, password, users) {
    return users.find(user =>
        user.email === email && user.password === password
    );
}


/**
 * Saves the currently logged-in user data to localStorage.
 * Note: The password is NOT stored for security reasons.
 * @param {Object} user - The user object retrieved from Firebase.
 */
function saveCurrentUser(user) {
    const userData = {
        name: user.name,
        email: user.email,
        color: user.color
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));
}


document.addEventListener("DOMContentLoaded", initLogin);
