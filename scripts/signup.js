const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";

const AVATAR_COLORS = [
    "#FF7A00", "#1FD7C1", "#462F8A", "#9327FF",
    "#FF5EB3", "#FCBE2D", "#6E52FF", "#FF4646"
];


/**
 * Initializes the sign-up page.
 * Attaches event listeners to the inputs and the submit button.
 */
function initSignup() {
    const inputs = document.querySelectorAll("#signup-form input");
    inputs.forEach(input => {
        input.addEventListener("input", validateForm);
    });

    const form = document.getElementById("signup-form");
    form.addEventListener("submit", handleSignup);
}


/**
 * Validates all fields and enables or disables the submit button.
 */
function validateForm() {
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm-password").value;
    const checkbox = document.getElementById("signup-checkbox").checked;

    const isValid = checkName(name)
        && checkEmail(email)
        && checkPassword(password)
        && checkConfirmPassword(password, confirm)
        && checkbox;

    document.getElementById("signup-btn").disabled = !isValid;
}


/**
 * Validates that the name field is not empty.
 * @param {string} name - The entered name.
 * @returns {boolean} True if the name is valid.
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
 * Validates that the email is valid (contains @ and .).
 * @param {string} email - The entered email address.
 * @returns {boolean} True if the email format is valid.
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
 * Validates that the password has at least 6 characters.
 * @param {string} password - The entered password.
 * @returns {boolean} True if the password is valid.
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
 * @param {string} password - The original password.
 * @param {string} confirm - The confirmed password.
 * @returns {boolean} True if both passwords match.
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
 * Handles the form submission: checks for duplicate emails, stores the user,
 * displays a success toast, and redirects to the login page.
 * @param {Event} event - The submit event from the form.
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
    showSuccessToast();
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 2000);
}


/**
 * Collects all form inputs into a single user data object.
 * @returns {Object} User object containing name, email, password, and color.
 */
function collectFormData() {
    return {
        name: document.getElementById("signup-name").value.trim(),
        email: document.getElementById("signup-email").value.trim(),
        password: document.getElementById("signup-password").value,
        color: getRandomColor()
    };
}


/**
 * Selects a random avatar background color from the predefined palette.
 * @returns {string} The chosen color as a hex string.
 */
function getRandomColor() {
    const index = Math.floor(Math.random() * AVATAR_COLORS.length);
    return AVATAR_COLORS[index];
}


/**
 * Checks whether an email address is already registered in Firebase.
 * @param {string} email - The email address to check.
 * @returns {Promise<boolean>} A promise that resolves to true if the email exists.
 */
async function checkEmailExists(email) {
    const response = await fetch(BASE_URL + "/users.json");
    const data = await response.json();
    if (!data) return false;

    const users = Object.values(data);
    return users.some(user => user.email === email);
}


/**
 * Saves a new user record to Firebase.
 * @param {Object} user - The user data object to be saved.
 */
async function saveUser(user) {
    await fetch(BASE_URL + "/users.json", {
        method: "POST",
        body: JSON.stringify(user)
    });
}


/**
 * Displays the success toast notification.
 */
function showSuccessToast() {
    const toast = document.getElementById("success-toast");
    toast.classList.add("show");
}


document.addEventListener("DOMContentLoaded", initSignup);
