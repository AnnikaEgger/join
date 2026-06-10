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
        <button type="button" id="card-${contact.id}" class="contact-item" onclick="showContactDetails('${contact.id}')">
            <div class="contact-avatar" style="background-color: ${contact.color}">${initials}</div>
            <div class="contact-info-short">
                <span class="contact-name">${contact.name}</span>
                <span class="contact-email">${contact.email}</span>
            </div>
        </button>`;
}

function generateDetailHTML(contact) {
  let initials = getInitials(contact.name);
  return `
        <div class="detail-header">
            <div class="detail-avatar" style="background-color: ${contact.color}">
                ${initials}
            </div>
            <div class="detail-name-section">
                <h3>${contact.name}</h3>
                <div class="edit-delete-section">
                    <button onclick="openEditContact('${contact.id}')" class="contact-action" type="button" aria-label="Edit Contact">
                        <img src="../assets/icons/edit-icon.svg" alt="Edit"> Edit
                    </button>
                    <button onclick="deleteContact('${contact.id}', event)" class="contact-action" type="button" aria-label="Delete Contact">
                        <img src="../assets/icons/delete-icon.svg" alt="Delete"> Delete
                    </button>
                </div>
            </div>
        </div>

        <div class="contact-info-headline">
            <span class="color-black">Contact Information</span>
        </div>

        <div class="detail-info-item">
            <b>Email</b>
            <a href="mailto:${contact.email}">${contact.email}</a>
        </div>

        <div class="detail-info-item">
            <b>Phone</b>
            <span class="color-black">${contact.phone}</span>
        </div>

        <div id="mobile-menu-container" class="mobile-menu-container" onclick="toggleMobileMenu()">
            <div class="mobile-menu-popup" onclick="event.stopPropagation()">
                <button type="button" class="contact-action" onclick="toggleMobileMenu(); openEditContact('${contact.id}')" aria-label="Edit Contact">
                    <img src="../assets/icons/edit-icon.svg" alt="Edit"> Edit
                </button>
                <button type="button" class="contact-action" onclick="toggleMobileMenu(); deleteContact('${contact.id}', event)" aria-label="Delete Contact">
                    <img src="../assets/icons/delete-icon.svg" alt="Delete"> Delete
                </button>
            </div>
        </div>

        <button id="mobile-menu-btn" class="mobile-menu-btn" onclick="toggleMobileMenu()">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </button>
    `;
}
