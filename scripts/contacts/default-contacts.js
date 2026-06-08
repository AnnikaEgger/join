/**
 * Default contact objects keyed by Firebase contact ID.
 * Includes a placeholder entry used for rendering fallback UI.
 * @constant {Object<string, Object>}
 */
const defaultContactsJson = {
  "-Othfm76L1VWTEk3enBt": {
    "color": "#FFBB2B",
    "email": "lange.vici@mail.de",
    "name": "Victoria Lange",
    "phone": "+49 1234 567 89 0",
  },
  "c10": {
    "color": "#1FD7C1",
    "email": "yvonne.mueller@yahoo.de",
    "name": "Yvonne Müller",
    "phone": "+49 1234 567 89 0",
  },
  "c22": {
    "color": "#FCBE2D",
    "email": "anton@gmail.com",
    "name": "Anton Meyer",
    "phone": "+49 1111 111 11 1",
  },
  "c3": {
    "color": "#6E52FF",
    "email": "benedikt@gmail.com",
    "name": "Benedikt Ziegler",
    "phone": "+49 1111 111 11 1",
  },
  "c5": {
    "color": "#FCBE2D",
    "email": "eva@gmail.com",
    "name": "Eva Fischer",
    "phone": "+49 1111 111 11 1",
  },
  "c6": {
    "color": "#1FD7C1",
    "email": "emmanuelma@gmail.com",
    "name": "Emmanuel Mauer",
    "phone": "+49 1111 111 11 1",
  },
  "c7": {
    "color": "#462F8A",
    "email": "bauer@gmail.com",
    "name": "Marcel Bauer",
    "phone": "+49 1111 111 11 12",
  },
  "c8": {
    "color": "#FF4646",
    "email": "wolf@gmail.com",
    "name": "Tatjana Wolf",
    "phone": "+49 2222 222 22 2",
  },
  "c9": {
    "color": "#462F8A",
    "email": "no.kie@web.de",
    "name": "Norbert Kiess",
    "phone": "+49 2222 222 22 2",
  },
  "dummy_placeholder": {
    "placeholder": true,
  },
};

/**
 * Uploads the default contacts object to Firebase under the "contacts" node.
 * @returns {Promise<void>}
 */
async function putDefaultContactsInFirebase() {
  await fetch(BASE_URL + "contacts" + ".json", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(defaultContactsJson),
  });
}
