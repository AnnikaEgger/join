/**
 * Generates HTML for a subtask list item with edit and delete buttons.
 * @param {Object} subtask - The subtask object containing title and status
 * @param {number} indexSubtask - The index of the subtask
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {string} HTML string for the subtask list item
 */
function subtaskLiTemplate(subtask, indexSubtask, id) {
  return `<li id="${"subtask-li-" + indexSubtask + id}" class="normal-li" tabindex="0" 
              data-index-subtask="${indexSubtask}"
                ondblclick="openSubtaskEdit(${indexSubtask}, '${id}')"
              >
            <p class="normal-li-p" id="${"subtask-text" + indexSubtask + id}">${subtask.title}</p>
            <div
              class="subtask-btns-container subtask-btns-container--ul"
            >
              <button
                type="button"
                class="subtask-btn-left normal-li-edit-btn"
                onclick="openSubtaskEdit(${indexSubtask}, '${id}')"
                aria-label="edit subtask"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 16.25H3.4L12.025 7.625L10.625 6.225L2 14.85V16.25ZM16.3 6.175L12.05 1.975L13.45 0.575C13.8333 0.191667 14.3042 0 14.8625 0C15.4208 0 15.8917 0.191667 16.275 0.575L17.675 1.975C18.0583 2.35833 18.2583 2.82083 18.275 3.3625C18.2917 3.90417 18.1083 4.36667 17.725 4.75L16.3 6.175ZM14.85 7.65L4.25 18.25H0V14L10.6 3.4L14.85 7.65Z"
                    fill="#2A3647"
                  />
                </svg>
              </button>
              <div class="subtask-btns-seperation-line"></div>
              <button
                type="button"
                class="subtask-btn-right normal-li-delete-btn"
                onclick="deleteSubtask(${indexSubtask}, '${id}')"
                aria-label="delete subtask"
              >
                <svg
                  width="16"
                  height="18"
                  viewBox="0 0 16 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z"
                    fill="#2A3647"
                  />
                </svg>
              </button>
            </div>
          </li>`;
}

/**
 * Generates HTML for a subtask list item with an input field for editing.
 * @param {number} indexSubtask - The index of the subtask
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {string} HTML string for the editable subtask list item
 */
function subtaskLiWithInputTemplate(indexSubtask, id) {
  return ` <li id="${"subtask-li-" + indexSubtask + id}" class="li-with-input trigger-input-container" tabindex="0">
            <textarea class="subtask-textarea" id="${"li-input" + indexSubtask + id}">${subtasksArr[indexSubtask].title}</textarea>
            <div
              class="subtask-btns-container subtask-btns-container--ul"
            >
              <button
                type="button"
                class="subtask-btn-left"
                id="delete-subtask-btn"
                onclick="deleteSubtask(${indexSubtask}, '${id}')"
                aria-label="delete subtask"
              >
                <svg
                  width="16"
                  height="18"
                  viewBox="0 0 16 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z"
                    fill="#2A3647"
                  />
                </svg>
              </button>
              <div class="subtask-btns-seperation-line"></div>
              <button onclick="submitEditedSubtask(${indexSubtask}, '${id}')" class="subtask-btn-right" type="button" aria-label="edit subtask">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 8.5L5 12.5L13 1"
                    stroke="#2A3647"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </li>`;
}

/**
 * Generates HTML for a contact option in the contact dropdown with checkbox.
 * @param {number} indexContact - The index of the contact
 * @param {string} initials - The contact's initials
 * @param {string} contactName - The contact's full name
 * @param {boolean} checkboxChecked - Whether the contact is already assigned
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {string} HTML string for the contact option
 */
function contactOptionTemplate(
  indexContact,
  initials,
  contactName,
  checkboxChecked,
  id,
) {
  return `<li
            id="contact-option-${indexContact}${id}"
            data-index-contact="${indexContact}"
            role="option"
            onclick="selectContact(${indexContact},'${filteredContacts[indexContact].id}', false, '${id}')"
            class="custom-select--option contact-option"
            tabindex="0"
          >
            <div class="contact-container">
              <span class="contact-avatar" style="background-color: ${filteredContacts[indexContact].color}">
               ${initials}
              </span>
              <p class="contact-full-name" id="contact-full-name">${contactName}</p>
            </div>
            <div class="checkbox-container">
              <input
              class="contact-option-checkbox"
               data-index-contact="${indexContact}"
               onclick="selectContact(${indexContact},'${filteredContacts[indexContact].id}', true, '${id}')"
                type="checkbox"
                aria-label="assign contact"
                name=""
                id="checkbox${indexContact}${id}"
                value="${filteredContacts[indexContact].name}"
                ${checkboxChecked ? "checked" : ""}
              />
            </div>
          </li>`;
}

/**
 * Generates HTML for an assigned contact avatar badge.
 * @param {number} indexAssignedContact - The index of the assigned contact
 * @param {string} initials - The contact's initials
 * @returns {string} HTML string for the contact avatar badge
 */
function contactAvatarTemplate(indexAssignedContact, initials) {
  return ` <span class="contact-avatar" style="background-color: ${assignedContacts[indexAssignedContact].color}">
            ${initials}
          </span>`;
}

/**
 * Generates the overflow badge that shows how many additional assigned contacts are hidden.
 * @param {number} count - The number of extra assigned contacts beyond the visible five
 * @returns {string} HTML string for the overflow badge
 */
function generateOverflowBadgeTemplate(count) {
  return `<span class="contact-avatar contact-avatar--plus">+${count}</span>`;
}

/**
 * Generates HTML for a category option in the category dropdown.
 * @param {number} indexCategory - The index of the category
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {string} HTML string for the category option
 */
function categoryOptionTemplate(indexCategory, id) {
  return `<li
            class="custom-select--option category-option"
            id="category-option-${indexCategory}${id}"
            data-index-category="${indexCategory}"
            onclick="selectCategory('${categoriesArr[indexCategory].title}', '${id}')"
            onkeypress="selectCategory('${categoriesArr[indexCategory].title}', '${id}')"
            tabindex="0"
          >
            ${categoriesArr[indexCategory].title}
          </li>`;
}