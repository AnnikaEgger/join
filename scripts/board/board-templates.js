/**
 * Creates the HTML for a draggable task card.
 *
 * @param {Object} todo - The task object.
 * @param {string} todo.id - Unique task identifier key.
 * @param {string} [todo.category] - Functional display category classification.
 * @param {string} todo.title - Display title header.
 * @param {string} todo.description - Informative body text snippet.
 * @param {string} catColor - The category badge styling background color.
 * @param {string} progressBar - The pre-rendered progress bar HTML layout component.
 * @param {string} badgesHTML - The pre-rendered assigned contact badges inline elements.
 * @param {string} prioIconHTML - The pre-rendered structural priority icon asset indicator.
 * @returns {string} The formatted task card HTML article layout string.
 */
function generateTodoHTML(
  todo,
  catColor,
  progressBar,
  badgesHTML,
  prioIconHTML,
) {
  return `<article draggable="true" aria-label="Draggable todo item" tabindex="0"
                onclick="openTaskDialog('${todo["id"]}')"
                ontouchstart="startDragging(event, '${todo["id"]}')" 
                ontouchmove="handleTouchMove(event)" 
                ontouchend="stopDragging(event)" 
                ondragstart="startDragging(event, '${todo["id"]}')" 
                ondragend="stopDragging(event)" class="card">
                <span class="category-field" style="background-color: ${catColor}">${todo["category"] || "User Story"}</span>
                <h3 class="card-text">${todo["title"]}</h3>
                <p class="card-descr">${todo["description"]}</p>
                ${progressBar}
                <div class="card-footer">
                    <div class="badge-container">${badgesHTML}</div>
                    ${prioIconHTML}
                </div>
             </article>`;
}

/**
 * Creates a progress bar snippet for the task card.
 *
 * @param {number} done - Number of completed subtasks.
 * @param {number} total - Total number of subtasks.
 * @param {number} percentage - Completion percentage scaling factor out of 100.
 * @returns {string} The progress structural container HTML snippet string.
 */
function generateProgressHTML(done, total, percentage) {
  return `
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
            </div>
            <label class="progress-label">${done}/${total} Subtasks</label>
        </div>
    `;
}

/**
 * Creates the detailed task dialog HTML.
 *
 * @param {Object} todo - The task data to display.
 * @param {string} todo.title - Primary text element header value.
 * @param {string} [todo.description] - Supplemental explanation details text block.
 * @param {string} [todo.due_date] - Date limit representation layout.
 * @param {string} [todo.priority] - Active triage label mapping notation.
 * @param {string} [todo.category] - Functional category label text.
 * @param {string} catColor - Category coloring scheme code hex/rgb representation.
 * @param {string} id - Database reference task key identifier.
 * @param {string} contactsListHTML - Rendered contact list block collection layouts.
 * @param {string} subtasksListHTML - Rendered subtask target checking elements collection.
 * @param {string} prioIconHTML - Rendered priority graphic element mapping wrapper.
 * @returns {string} The task detailed single dialog modal view HTML string.
 */
function generateTaskDialogHTML(
  todo,
  catColor,
  id,
  contactsListHTML,
  subtasksListHTML,
  prioIconHTML,
) {
  return `
      <div id="content-wrapper--task-dialog" class="content-wrapper-task-dialog content-wrapper-task-dialog--detailed disabled-ui">
          <div class="task-dialog-header">
              <span class="category-field-dialog" style="background-color: ${catColor}">${todo["category"] || "User Story"}</span>
              <button class="close-task-dialog-btn" tabindex="0" onclick="closeTaskDialog()"><img src="../assets/icons/close-icon.svg" alt="Close Task Dialog Icon"></button>
          </div>
          <h1 class="dialog-task-title">${todo["title"]}</h1>
          <p class="dialog-description">${todo["description"] || ""}</p>
          <div class="dialog-prio-date">
              <div class="dialog-prio-row"><p class="dialog-text-label">Due date:</p> ${todo["due_date"] || "No date"}</div>
              <div class="dialog-prio-row"><p class="dialog-text-label">Priority:</p> ${todo["priority"] || "Low"} ${prioIconHTML}</div>
          </div>
          <div class="dialog-assigned-section"><p class="dialog-text-label">Assigned To:</p><div class="dialog-contacts-container">${contactsListHTML}</div></div>
          <div class="dialog-subtasks-section"><p class="dialog-text-label">Subtasks:</p><div class="dialog-subtasks-container">${subtasksListHTML}</div></div>
          <section class="dialog-footer">
                  <button id="delete-task-btn" class="delete-task-btn task-dialog-btn" onclick="deleteTask('${id}')">
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z" fill="#2A3647"/>
                    </svg>
                    <p>Delete</p>
                  </button>
                  <hr class="dialog-footer-hr">
                  <button id="edit-task-btn" class="edit-task-btn task-dialog-btn" onclick="openTaskEditMode('${id}')">
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 16.25H3.4L12.025 7.625L10.625 6.225L2 14.85V16.25ZM16.3 6.175L12.05 1.975L13.45 0.575C13.8333 0.191667 14.3042 0 14.8625 0C15.4208 0 15.8917 0.191667 16.275 0.575L17.675 1.975C18.0583 2.35833 18.2583 2.82083 18.275 3.3625C18.2917 3.90417 18.1083 4.36667 17.725 4.75L16.3 6.175ZM14.85 7.65L4.25 18.25H0V14L10.6 3.4L14.85 7.65Z" fill="#2A3647"/>
                    </svg>
                    <p>Edit</p>

                  </button>
          </section>
        </div>
     `;
}

/**
 * Creates one assigned-contact row for the dialog view layout.
 *
 * @param {string} name - Explicit alphabetical identity name text value.
 * @param {string} color - Explicit CSS-usable background-color rendering value.
 * @param {string} initials - Formatted capital string acronym indicator token.
 * @returns {string} The contact structural single row entry representation template string.
 */
function generateDialogContactsHTML(name, color, initials) {
  return `
        <div class="dialog-contact-row">
            <span class="profile-badge" style="background-color: ${color}">${initials}</span>
            <span class="dialog-contact-name">${name}</span>
        </div>`;
}

/**
 * Creates one subtask checkbox row for the detailed presentation overlay view.
 *
 * @param {string} todoId - Target contextual key indicator string for database location lookup.
 * @param {number} index - Structural indexing tracker configuration key value.
 * @param {string} title - Explicit short naming details description element text.
 * @param {string} isChecked - Native attribute string rendering placeholder expression text field.
 * @param {string} checkboxId - Unique checkbox ID.
 * @returns {string} The interactive target inline item structure layout representation code.
 */
function generateDialogSubtasksHTML(
  todoId,
  index,
  title,
  isChecked,
  checkboxId,
) {
  return `
        <div class="dialog-subtask-row">
            <input type="checkbox" id="${checkboxId}" ${isChecked} 
                   onclick="toggleSubtask('${todoId}', ${index})">
            
            <label for="${checkboxId}" class="custom-subtask-checkbox">
                <img src="../assets/icons/checkbox-rect.svg" class="cb-empty" alt="Unchecked">
                <img src="../assets/icons/checkbox.svg" class="cb-checked" alt="Checked">
                <span class="subtask-title-text">${title}</span>
            </label>
        </div>`;
}

/**
 * Creates an image tag for the priority representation asset icon.
 *
 * @param {string} src - File asset local/external destination reference target pathway value.
 * @param {string} prio - Level priority label context descriptor name.
 * @returns {string} The complete responsive structural token node layout string markup.
 */
function generatePrioIconHTML(src, prio) {
  return `<img src="${src}" alt="${prio} priority icon">`;
}

/**
 * Creates the empty-state card component for an unpopulated active board row context column.
 *
 * @param {string} category - Dynamic textual display title tag.
 * @returns {string} The raw layout definition block markup template framework data.
 */
function generateEmptySectionHTML(category) {
  return `
        <div class="empty-card-container">
          <div class="empty-icon-wrapper">
            <p>${category}</p>
          </div>
        </div>
    `;
}

/**
 * Creates one standalone profile presentation badge layer component item.
 *
 * @param {string} initials - Key textual sequence.
 * @param {string} color - Key color format expression.
 * @returns {string} The single token icon node markup presentation structural block template.
 */
function generateSingleBadgeHTML(initials, color) {
  return `<span class="profile-badge" style="background-color: ${color}">${initials}</span>`;
}

/**
 * Creates an index counts overflow value tracker asset bubble.
 *
 * @param {number} count - Total index sum of hidden entry units remaining.
 * @returns {string} The badge textual container markup block snippet configuration code.
 */
function generateOverflowBadgeHTML(count) {
  return `<span class="profile-badge-plus">+${count}</span>`;
}

/**
 * Creates a clear fallback container layout element wrapper block markup structure.
 *
 * @returns {string} The standard clear default empty value placeholder element layout markup.
 */
function generateEmptyBadgeHTML() {
  return '<span class="profile-empty-badge">--</span>';
}