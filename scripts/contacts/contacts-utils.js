/**
 * Generates uppercase initials from a name.
 * @param {string} name - Full name of the contact.
 * @returns {string} Initials (e.g., "JD").
 */
function getInitials(name) {
  let firstLetter = name.charAt(0);
  let spaceIndex = name.indexOf(" ");
  let secondLetter = "";

  if (spaceIndex !== -1) {
    secondLetter = name.charAt(spaceIndex + 1);
  }

  return (firstLetter + secondLetter).toUpperCase();
}

/**
 * Returns a random color string from the predefined palette.
 * @returns {string} Hex color code.
 */
function getRandomColor() {
  let colors = [
    "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8",
    "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701",
    "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"
  ];

  let randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

/**
 * Displays the success confirmation banner temporarily.
 * @returns {void}
 */
function showSuccessBanner() {
  let banner = document.getElementById("success-banner");
  banner.classList.add("show-banner");

  setTimeout(() => {
    banner.classList.remove("show-banner");
  }, 3000);
}

/**
 * Focuses the mobile back button for better accessibility.
 * @returns {void}
 */
function focusBackButton() {
  let backBtn = document.querySelector(".back-to-list-btn");
  if (backBtn) {
    backBtn.focus();
  }
}

/**
 * Focuses the appropriate close button depending on screen size.
 * @returns {void}
 */
function focusActiveCloseButton() {
  let isMobile = window.innerWidth <= 1024;
  let selector = isMobile ? ".dialog-close-btn-mobile" : ".dialog-close-btn";
  let closeBtn = document.querySelector(selector);
  if (closeBtn) closeBtn.focus();
}

/**
 * Focuses the first button inside the mobile menu pop-up.
 * @returns {void}
 */
function focusFirstMenuAction() {
  let firstAction = document.querySelector(
    ".mobile-menu-popup .contact-action",
  );
  if (firstAction) firstAction.focus();
}

/**
 * Delays the focus handling for the mobile menu to ensure smooth execution.
 * @returns {void}
 */
function delayMenuFocus() {
  setTimeout(focusFirstMenuAction, 100);
}