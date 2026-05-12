/**
 * Gibt eine Begrüßung basierend auf der aktuellen Uhrzeit zurück.
 * @returns {string}
 */
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};


/**
 * Liest den aktuellen User aus dem localStorage.
 * @returns {object|null}
 */
const getCurrentUser = () => {
    const stored = localStorage.getItem("currentUser");
    if (stored === null) return null;
    try {
        return JSON.parse(stored);
    } catch (error) {
        return null;
    }
};


/**
 * generiert initialien 
 * @param {string} name
 * @returns {string}
 */
const getInitials = (name) => {
    const parts = name.split(" ");
    const first = parts[0].charAt(0).toUpperCase();
    if (parts.length < 2) return first;
    return first + parts[1].charAt(0).toUpperCase();
};


/**
 * initialien oben im header 
 * @param {object|null} user
 */
const updateHeaderAvatar = (user) => {
    const avatar = document.getElementById("header-avatar");
    if (user === null || user.isGuest === true) {
        avatar.textContent = "G";
        return;
    }
    avatar.textContent = getInitials(user.name);
};


/**
   Begrüßungstext und Namen.
 * @param {object|null} user
 */
const updateGreeting = (user) => {
    const greetingText = document.getElementById("greeting-text");
    const greetingName = document.getElementById("greeting-name");
    const greeting = getGreeting();
    if (user === null || user.isGuest === true) {
        greetingText.textContent = greeting + "!";
        greetingName.textContent = "";
        return;
    }
    greetingText.textContent = greeting + ",";
    greetingName.textContent = user.name;
};


const initSummary = () => {
    const user = getCurrentUser();
    updateHeaderAvatar(user);
    updateGreeting(user);
};


document.addEventListener("DOMContentLoaded", initSummary);