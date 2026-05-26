/**
 * Page Protection: Checks upon page load whether a user exists
 * in localStorage. If not, redirects to the login page.
 * Executed automatically as an IIFE during script load.
 */
(function guardPage() {
    const stored = localStorage.getItem("currentUser");

    if (!stored) {
        window.location.href = "../index.html";
        return;
    }

    try {
        JSON.parse(stored);
    } catch (e) {
        localStorage.removeItem("currentUser");
        window.location.href = "../index.html";
    }
})();
