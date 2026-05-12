const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/.json";
let contacts = [];

async function init() {
    await loadContacts();
    renderContactList();
}

async function loadContacts() {
    let response = await fetch(BASE_URL);
    let data = await response.json();

    if (data && data.contacts) {
        fillContactsArray(data.contacts);
        contacts.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
    }
}

function fillContactsArray(contactsObj) {
    let keys = Object.keys(contactsObj);

    for (let i = 0; i < keys.length; i++) {
        let id = keys[i];
        let contactData = contactsObj[id];
        contactData.id = id;
        contacts.push(contactData);
    }
}

function renderContactList() {
    let content = document.getElementById('contact-list');
    content.innerHTML = '';
    let currentLetter = '';

    for (let i = 0; i < contacts.length; i++) {
        let contact = contacts[i];
        let firstLetter = contact.name.charAt(0).toUpperCase();

        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            content.innerHTML += renderLetterHeader(currentLetter);
        }
        content.innerHTML += generateContactHTML(contact);
    }
}

function getInitials(name) {
    let firstLetter = name.charAt(0);
    let spaceIndex = name.indexOf(' ');
    let secondLetter = '';

    if (spaceIndex !== -1) {
        secondLetter = name.charAt(spaceIndex + 1);
    }

    return (firstLetter + secondLetter).toUpperCase();
}

function showContactDetails(id) {
    highlightContact(id);
    let contact = null;

    for (let i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) {
            contact = contacts[i];
            break;
        }
    }

    if (contact) {
        document.getElementById('contact-detail-content').innerHTML = generateDetailHTML(contact);
    }
}

function highlightContact(id) {
    let allCards = document.getElementsByClassName('contact-item');
    for (let i = 0; i < allCards.length; i++) {
        allCards[i].classList.remove('contact-item-active');
    }

    let activeCard = document.getElementById(`card-${id}`);
    if (activeCard) {
        activeCard.classList.add('contact-item-active');
    }
}

async function deleteContact(id) {
    let url = `https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/contacts/${id}.json`;
    
    await fetch(url, {
        method: "DELETE"
    });

    document.getElementById('contact-detail-content').innerHTML = '';
    
    await init();
}

async function loadContacts() {
    contacts = [];
    let response = await fetch(BASE_URL);
    let data = await response.json();

    if (data && data.contacts) {
        fillContactsArray(data.contacts);
        contacts.sort((a, b) => a.name.localeCompare(b.name));
    }
}

function openAddContact() {
    document.getElementById('add-contact-overlay').classList.remove('d-none');
}

function closeAddContact() {
    document.getElementById('add-contact-overlay').classList.add('d-none');
}