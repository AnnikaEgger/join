/**
 * Loggt den User als Gast ein.
 * Speichert ein Gast-Objekt in localStorage und leitet zur Summary weiter.
 */
function guestLogin() {
    const guestUser = {
        isGuest: true,
        name: "Guest"
    };

    localStorage.setItem("currentUser", JSON.stringify(guestUser));
    window.location.href = "./html/summary.html";
}
const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Loggt den User als Gast ein.
 * Speichert ein Gast-Objekt in localStorage und leitet zur Summary weiter.
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
 * Initialisiert die Login-Seite.
 * Verknüpft Event-Listener auf Inputs und Submit-Button.
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
 * Löscht alle Fehlermeldungen auf der Login-Seite.
 */
function clearAllLoginErrors() {
    clearError("error-login-email");
    clearError("error-login-password");
    clearError("error-login-general");
}


/**
 * Validiert die Login-Felder.
 * @returns {boolean} true wenn beide Felder gültig sind
 */
function validateLoginForm() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const emailValid = checkLoginEmail(email);
    const passwordValid = checkLoginPassword(password);

    return emailValid && passwordValid;
}


/**
 * Prüft die Login-Email auf Format.
 * @param {string} email - Eingegebene Email
 * @returns {boolean} true wenn gültig
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
 * Prüft das Login-Passwort.
 * @param {string} password - Eingegebenes Passwort
 * @returns {boolean} true wenn nicht leer
 */
function checkLoginPassword(password) {
    if (password.length === 0) {
        showError("error-login-password", "Please enter your password");
        return false;
    }
    return true;
}


/**
 * Zeigt eine Fehlermeldung unter dem Input an.
 * @param {string} errorId - ID des Error-Spans
 * @param {string} message - Anzuzeigender Text
 */
function showError(errorId, message) {
    document.getElementById(errorId).textContent = message;
}


/**
 * Entfernt eine Fehlermeldung.
 * @param {string} errorId - ID des Error-Spans
 */
function clearError(errorId) {
    document.getElementById(errorId).textContent = "";
}


/**
 * Verarbeitet den Login-Submit: validiert, lädt User aus Firebase,
 * matcht Email+Passwort und leitet bei Erfolg zur Summary weiter.
 * @param {Event} event - Submit-Event vom Form
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
 * Lädt alle User aus Firebase.
 * @returns {Promise<Array>} Array aller User oder leeres Array
 */
async function loadAllUsers() {
    const response = await fetch(BASE_URL + "/users.json");
    const data = await response.json();
    if (!data) return [];
    return Object.values(data);
}


/**
 * Sucht einen User mit passender Email und Passwort.
 * @param {string} email - Eingegebene Email
 * @param {string} password - Eingegebenes Passwort
 * @param {Array} users - Array aller User
 * @returns {Object|undefined} Gefundener User oder undefined
 */
function findMatchingUser(email, password, users) {
    return users.find(user =>
        user.email === email && user.password === password
    );
}


/**
 * Speichert den eingeloggten User in localStorage.
 * Passwort wird aus Sicherheitsgründen NICHT gespeichert.
 * @param {Object} user - User-Objekt aus Firebase
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