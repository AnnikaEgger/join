const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";


/**
 * Initialisiert die Summary-Seite: User laden, Avatar + Greeting setzen,
 * Task-Daten aus Firebase fetchen und Metriken rendern.
 */
async function initSummary() {
    const user = getCurrentUser();
    updateHeaderAvatar(user);
    updateGreeting(user);
    await loadSummaryData();
}


/**
 * Liest den aktuell eingeloggten User aus localStorage.
 * @returns {Object|null} User-Objekt oder null wenn nicht eingeloggt / kaputtes JSON
 */
function getCurrentUser() {
    const stored = localStorage.getItem("currentUser");
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
}


/**
 * Erstellt Initialen aus einem Namen (z.B. "Max Müller" → "MM").
 * @param {string} name - Voller Name des Users
 * @returns {string} Initialen in Großbuchstaben (max. 2 Zeichen)
 */
function getInitials(name) {
    const parts = name.trim().split(" ");
    const first = parts[0].charAt(0).toUpperCase();
    if (parts.length < 2) return first;
    return first + parts[1].charAt(0).toUpperCase();
}


/**
 * Gibt eine tageszeit-abhängige Begrüßung zurück.
 * @returns {string} "Good morning", "Good afternoon" oder "Good evening"
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}


/**
 * Aktualisiert den Header-Avatar mit Initialen oder "G" für Gast.
 * @param {Object|null} user - User-Objekt aus localStorage
 */
function updateHeaderAvatar(user) {
    const avatar = document.getElementById("header-avatar");
    if (!user || user.isGuest) {
        avatar.textContent = "G";
        return;
    }
    avatar.textContent = getInitials(user.name);
}


/**
 * Aktualisiert den Begrüßungstext und Namen je nach User-Status.
 * @param {Object|null} user - User-Objekt aus localStorage
 */
function updateGreeting(user) {
    const text = document.getElementById("greeting-text");
    const name = document.getElementById("greeting-name");
    const greeting = getGreeting();
    if (!user || user.isGuest) {
        text.textContent = greeting + "!";
        name.textContent = "";
        return;
    }
    text.textContent = greeting + ",";
    name.textContent = user.name;
}


/**
 * Lädt alle Tasks aus Firebase und übergibt sie an das Rendering.
 */
async function loadSummaryData() {
    const response = await fetch(BASE_URL + "/tasks.json");
    const data = await response.json();
    if (data) renderMetrics(data);
}


/**
 * Rendert alle Task-Counter und Deadline-Infos auf der Summary-Seite.
 * @param {Object} tasks - Tasks-Objekt aus Firebase
 */
function renderMetrics(tasks) {
    const arr = Object.values(tasks);
    renderStatusCounts(arr);
    renderUrgentSection(arr);
}


/**
 * Setzt die Counter für alle Status-Spalten und die Gesamtanzahl.
 * @param {Array} arr - Array aller Tasks
 */
function renderStatusCounts(arr) {
    document.getElementById("count-board").textContent = arr.length;
    document.getElementById("count-todo").textContent = countByStatus(arr, "todo");
    document.getElementById("count-progress").textContent = countByStatus(arr, "inProgress");
    document.getElementById("count-feedback").textContent = countByStatus(arr, "awaitingFeedback");
    document.getElementById("count-done").textContent = countByStatus(arr, "done");
}


/**
 * Zählt Tasks mit einem bestimmten Status.
 * @param {Array} arr - Array aller Tasks
 * @param {string} status - Status-Name (z.B. "todo")
 * @returns {number} Anzahl matchender Tasks
 */
function countByStatus(arr, status) {
    return arr.filter(t => t.status === status).length;
}


/**
 * Rendert die Urgent-Anzahl und die früheste Urgent-Deadline.
 * @param {Array} arr - Array aller Tasks
 */
function renderUrgentSection(arr) {
    const urgent = arr.filter(t => t.prio === "urgent");
    document.getElementById("count-urgent").textContent = urgent.length;
    if (urgent.length > 0) {
        const date = urgent.map(t => t.date).sort()[0];
        document.getElementById("deadline-date").textContent = formatDeadline(date);
    }
}


/**
 * Formatiert ein Datum für die Deadline-Anzeige (z.B. "May 16, 2026").
 * @param {string} dateString - Datum als ISO-String
 * @returns {string} Lesbar formatiertes Datum
 */
function formatDeadline(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


/**
 * Öffnet/schließt das Dropdown-Menü am Header-Avatar.
 */
function toggleDropdown() {
    const drop = document.getElementById("dropdown");
    drop.classList.toggle("d-none");
}


/**
 * Schließt das Dropdown wenn außerhalb geklickt wird.
 * @param {Event} event - Click-Event
 */
function closeDropdownOnOutsideClick(event) {
    const drop = document.getElementById("dropdown");
    const avatar = document.getElementById("header-avatar");
    if (!avatar.contains(event.target) && !drop.contains(event.target)) {
        drop.classList.add("d-none");
    }
}


/**
 * Loggt den User aus: localStorage leeren und zurück zur Login-Seite.
 */
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
}


document.addEventListener("DOMContentLoaded", initSummary);
document.addEventListener("click", closeDropdownOnOutsideClick);