/**
 * Initializes the header. Sets avatar and outside-click listener.
 * @returns {void}
 */
function initHeader() {
  const avatar = document.getElementById("header-avatar");
  if (!avatar) return;
  const user = getCurrentUser();
  updateHeaderAvatar(user);
  document.addEventListener("click", closeDropdownOnOutsideClick);
}

/**
 * Reads current user from localStorage.
 * @returns {Object|null} User object or null
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
 * Returns up to 2 uppercase initials from a name.
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitials(name) {
  const parts = name.trim().split(" ");
  const first = parts[0].charAt(0).toUpperCase();
  if (parts.length < 2) return first;
  return first + parts[1].charAt(0).toUpperCase();
}

/**
 * Sets avatar text and color, or "G" for guest.
 * @param {Object|null} user - User object
 * @returns {void}
 */
function updateHeaderAvatar(user) {
  const avatar = document.getElementById("header-avatar");
  if (!user || user.isGuest) {
    avatar.textContent = "G";
    avatar.style.backgroundColor = "white";
    return;
  }
  avatar.textContent = getInitials(user.name);
  if (user.color) {
    avatar.style.backgroundColor = user.color;
    avatar.style.color = "white";
    avatar.style.borderColor = user.color;
  }
}

/**
 * Toggles the header dropdown menu.
 * @returns {void}
 */
function toggleDropdown() {
  const drop = document.getElementById("dropdown");
  drop.classList.toggle("d-none");
}

/**
 * Closes the dropdown on outside click.
 * @param {Event} event - Click event
 * @returns {void}
 */
function closeDropdownOnOutsideClick(event) {
  const drop = document.getElementById("dropdown");
  const avatar = document.getElementById("header-avatar");
  if (!drop || !avatar) return;
  if (!avatar.contains(event.target) && !drop.contains(event.target)) {
    drop.classList.add("d-none");
  }
}

/**
 * Logs out: clears localStorage and redirects to login.
 * @returns {void}
 */
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "../index.html";
}

document.addEventListener("DOMContentLoaded", initHeader);