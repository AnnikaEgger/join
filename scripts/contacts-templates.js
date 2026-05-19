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
        <div id="card-${contact.id}" class="contact-item" onclick="showContactDetails('${contact.id}')">
            <div class="contact-avatar" style="background-color: ${contact.color}">${initials}</div>
            <div class="contact-info-short">
                <span class="contact-name">${contact.name}</span>
                <span class="contact-email">${contact.email}</span>
            </div>
        </div>`;
}

function generateDetailHTML(contact) {
    let initials = getInitials(contact.name);
    return `
        <div class="detail-header">
            <div class="detail-avatar" style="background-color: ${contact.color}">
                ${initials}
            </div>
            <div class="detail-name-section">
                <h1>${contact.name}</h1>
                <div class="edit-delete-section">
                    <div onclick="openEditContact('${contact.id}')" class="contact-action">
                        <img src="../assets/icons/edit-icon.svg" alt="Edit"> Edit
                    </div>
                    <div onclick="deleteContact('${contact.id}')" class="contact-action">
                        <img src="../assets/icons/delete-icon.svg" alt="Delete"> Delete
                    </div>
                </div>
            </div>
        </div>

        <div class="contact-info-headline">
            <span>Contact Information</span>
        </div>

        <div class="detail-info-item">
            <b>Email</b>
            <a href="mailto:${contact.email}">${contact.email}</a>
        </div>

        <div class="detail-info-item">
            <b>Phone</b>
            <span>${contact.phone}</span>
        </div>
    `;
}