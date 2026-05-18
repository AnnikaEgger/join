const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";

const AVATAR_COLORS = [
    "#FF7A00", "#1FD7C1", "#462F8A", "#9327FF",
    "#FF5EB3", "#FCBE2D", "#6E52FF", "#FF4646"
];


/**
 * Initialisiert die Sign-up-Seite.
 * Verknüpft Event-Listener auf Inputs und Submit-Button.
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
 * Prüft alle Felder und aktiviert/deaktiviert den Submit-Button.
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
 * Prüft ob der Name nicht leer ist.
 * @param {string} name - Eingegebener Name
 * @returns {boolean} true wenn gültig
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
 * Prüft ob die Email gültig ist (enthält @ und .).
 * @param {string} email - Eingegebene Email
 * @returns {boolean} true wenn gültig
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
 * Prüft ob das Passwort mindestens 6 Zeichen hat.
 * @param {string} password - Eingegebenes Passwort
 * @returns {boolean} true wenn gültig
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
 * Prüft ob die beiden Passwörter übereinstimmen.
 * @param {string} password - Passwort
 * @param {string} confirm - Bestätigtes Passwort
 * @returns {boolean} true wenn übereinstimmend
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
 * Verarbeitet den Submit: prüft Email-Duplikat, speichert User,
 * zeigt Toast und leitet zur Login-Seite weiter.
 * @param {Event} event - Submit-Event vom Form
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
 * Sammelt alle Form-Daten in ein User-Objekt.
 * @returns {Object} User-Objekt mit name, email, password, color
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
 * Wählt eine zufällige Avatar-Farbe aus dem Pool.
 * @returns {string} Hex-Farbe als String
 */
function getRandomColor() {
    const index = Math.floor(Math.random() * AVATAR_COLORS.length);
    return AVATAR_COLORS[index];
}


/**
 * Prüft ob eine Email bereits in Firebase existiert.
 * @param {string} email - Zu prüfende Email
 * @returns {Promise<boolean>} true wenn Email schon existiert
 */
async function checkEmailExists(email) {
    const response = await fetch(BASE_URL + "/users.json");
    const data = await response.json();
    if (!data) return false;

    const users = Object.values(data);
    return users.some(user => user.email === email);
}


/**
 * Speichert einen neuen User in Firebase.
 * @param {Object} user - User-Objekt
 */
async function saveUser(user) {
    await fetch(BASE_URL + "/users.json", {
        method: "POST",
        body: JSON.stringify(user)
    });
}


/**
 * Zeigt die Erfolgs-Toast-Meldung an.
 */
function showSuccessToast() {
    const toast = document.getElementById("success-toast");
    toast.classList.add("show");
}


document.addEventListener("DOMContentLoaded", initSignup);