const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const getCurrentUser = () => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
};

const getInitials = (name) => {
    const parts = name.split(" ");
    const first = parts[0].charAt(0).toUpperCase();
    if (parts.length < 2) return first;
    return first + parts[1].charAt(0).toUpperCase();
};

const updateHeaderAvatar = (user) => {
    const avatar = document.getElementById("header-avatar"); // Header
    if (!user || user.isGuest) {
        avatar.textContent = "G";
        return;
    }
    avatar.textContent = getInitials(user.name);
};

const updateGreeting = (user) => {
    const text = document.getElementById("greeting-text"); // Text
    const name = document.getElementById("greeting-name"); // Name
    const greeting = getGreeting();
    if (!user || user.isGuest) {
        text.textContent = greeting + "!";
        name.textContent = "";
        return;
    }
    text.textContent = greeting + ",";
    name.textContent = user.name;
};

async function loadSummaryData() {
    try {
        const response = await fetch(BASE_URL + "/tasks.json"); // Firebase
        const data = await response.json();
        if (data) renderMetrics(data);
    } catch (e) {
        console.error(e);
    }
}

function renderMetrics(tasks) {
    const arr = Object.values(tasks); // Array
    document.getElementById('count-board').textContent = arr.length;
    document.getElementById('count-todo').textContent = arr.filter(t => t.status === 'todo').length;
    document.getElementById('count-progress').textContent = arr.filter(t => t.status === 'inProgress').length;
    document.getElementById('count-feedback').textContent = arr.filter(t => t.status === 'awaitingFeedback').length;
    document.getElementById('count-done').textContent = arr.filter(t => t.status === 'done').length;

    const urgent = arr.filter(t => t.prio === 'urgent'); // Urgent
    document.getElementById('count-urgent').textContent = urgent.length;
    if (urgent.length > 0) {
        const date = urgent.map(t => t.date).sort()[0];
        document.getElementById('deadline-date').textContent = new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}

const initSummary = async () => {
    const user = getCurrentUser(); // User
    updateHeaderAvatar(user);
    updateGreeting(user);
    await loadSummaryData(); // Data
};

document.addEventListener("DOMContentLoaded", initSummary);
function toggleDropdown() {
    const drop = document.getElementById('dropdown');
    drop.classList.toggle('d-none'); // Umschalten
}

window.onclick = function(event) {
    const drop = document.getElementById('dropdown');
    const avatar = document.getElementById('header-avatar');
    if (!avatar.contains(event.target) && !drop.contains(event.target)) {
        drop.classList.add('d-none'); // Schließen
    }
};

function logout() {
    localStorage.removeItem("currentUser"); // Löschen
    window.location.href = "index.html"; // Weiterleitung
}