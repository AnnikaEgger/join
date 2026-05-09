function renderLetterHeader(letter) {
    return `
        <div class="letter-section">
            <div class="letter-header">${letter}</div>
            <div class="letter-divider"></div>
        </div>`;
}

function generateContactHTML(contact) {
    let initials = getInitials(contact.name);
    
    return `
        <div class="contact-item" onclick="showContactDetails('${contact.id}')">
            <div class="contact-avatar" style="background-color: ${contact.color}">${initials}</div>
            <div class="contact-info-short">
                <span class="contact-name">${contact.name}</span>
                <span class="contact-email">${contact.email}</span>
            </div>
        </div>`;
}