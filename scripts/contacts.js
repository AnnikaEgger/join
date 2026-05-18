const BASE_URL = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/.json";
let contacts = [];

async function init() {
    await loadContacts();
    renderContactList();
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
    let contact = findContactById(id);

    if (contact) {
        prepareDetailsAnimation();
        renderDetails(contact);
        startDetailsAnimation();
    }
}

function findContactById(id) {
    for (let i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) return contacts[i];
    }
    return null;
}

function prepareDetailsAnimation() {
    let view = document.getElementById('contact-detail-view');
    view.classList.remove('show-detail');
}

function renderDetails(contact) {
    let content = document.getElementById('contact-detail-content');
    content.innerHTML = generateDetailHTML(contact);
}

function startDetailsAnimation() {
    setTimeout(() => {
        let view = document.getElementById('contact-detail-view');
        view.classList.add('show-detail');
    }, 50);
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

async function createNewContact() {
    let name = document.querySelector('.icon-name').value;
    let email = document.querySelector('.icon-mail').value;
    let phone = document.querySelector('.icon-phone').value;
    let color = getRandomColor();

    let newContact = { name, email, phone, color };

    await postContact(newContact);
    await finalizeAddition();
}

async function postContact(contact) {
    let url = "https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    });
}

async function finalizeAddition() {
    closeAddContact();
    await init();
    resetForm();
}

function resetForm() {
    document.querySelector('.contact-form').reset();
}

function getRandomColor() {
    let colors = ['#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];

    let randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

async function deleteContact(id) {
    let url = `https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/contacts/${id}.json`;

    await fetch(url, {
        method: "DELETE"
    });

    document.getElementById('contact-detail-content').innerHTML = '';
    await init();
}

function openAddContact() {
    document.getElementById('add-contact-overlay').classList.add('show-overlay');
}

function closeAddContact() {
    document.getElementById('add-contact-overlay').classList.remove('show-overlay');
}