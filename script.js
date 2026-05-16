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