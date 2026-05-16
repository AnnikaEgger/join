/**
 * Page Protection: Prüft beim Laden der Seite ob ein User
 * in localStorage existiert. Wenn nicht, Redirect zur Login-Seite.
 * Wird als IIFE automatisch beim Script-Load ausgeführt.
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