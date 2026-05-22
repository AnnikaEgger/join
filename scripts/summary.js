const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";


/**
 * Initializes the summary page. Sets greeting, loads tasks, runs mobile animation.
 */
async function initSummary() {
    const user = getCurrentUser();
    updateGreeting(user);
    await loadSummaryData();
    runMobileGreetingAnimation();
}


/**
 * Returns greeting based on time of day.
 * @returns {string} Greeting text
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}


/**
 * Updates greeting text and user name.
 * @param {Object|null} user - User object
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
 * Runs mobile greeting animation (only on screens ≤1024px).
 */
function runMobileGreetingAnimation() {
    if (window.innerWidth > 1024) return;
    const greeting = document.querySelector(".summary-greeting");
    const cards = document.querySelector(".summary-cards");
    setTimeout(() => {
        greeting.classList.add("fade-out");
        cards.classList.add("visible");
    }, 2000);
}


/**
 * Loads all tasks from Firebase.
 */
async function loadSummaryData() {
    const response = await fetch(BASE_URL + "/tasks.json");
    const data = await response.json();
    if (data) renderMetrics(data);
}


/**
 * Renders all counters and deadline info.
 * @param {Object} tasks - Tasks object from Firebase
 */
function renderMetrics(tasks) {
    const arr = Object.values(tasks);
    renderStatusCounts(arr);
    renderUrgentSection(arr);
}


/**
 * Sets status counters and total.
 * @param {Array} arr - All tasks
 */
function renderStatusCounts(arr) {
    document.getElementById("count-board").textContent = arr.length;
    document.getElementById("count-todo").textContent = countByStatus(arr, "todo");
    document.getElementById("count-progress").textContent = countByStatus(arr, "inProgress");
    document.getElementById("count-feedback").textContent = countByStatus(arr, "awaitingFeedback");
    document.getElementById("count-done").textContent = countByStatus(arr, "done");
}


/**
 * Counts tasks by status.
 * @param {Array} arr - All tasks
 * @param {string} status - Status to count
 * @returns {number} Count
 */
function countByStatus(arr, status) {
    return arr.filter(t => t.status === status).length;
}


/**
 * Renders urgent count and earliest deadline.
 * @param {Array} arr - All tasks
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
 * Formats date for deadline display.
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDeadline(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });
}


document.addEventListener("DOMContentLoaded", initSummary);