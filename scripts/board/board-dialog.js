/**
 * Opens the task detail dialog and fills it with the dynamic Firebase data.
 *
 * @param {string} id - The ID of the task to display in the dialog.
 * @returns {void}
 */
function openTaskDialog(id) {
  let todo = todos.find((t) => t.id === id);
  if (!todo) return;

  let dialog = document.getElementById("taskDialog");

  renderTaskDialog(id, todo, dialog);

  dialog.showModal();
  enableAllPointerEvents("taskDialog");
}

/**
 * Renders the task detail dialog content with contacts, subtasks, priority icon, and category styling.
 *
 * @param {string} id - The task ID used to render the dialog and wire action buttons.
 * @param {Object} todo - The task object containing title, description, contacts, and subtasks.
 * @param {HTMLDialogElement} dialog - The dialog element to populate.
 * @returns {void}
 */
function renderTaskDialog(id, todo, dialog) {
  let contactsListHTML = renderDialogContacts(todo);
  let subtasksListHTML = renderDialogSubtasks(todo, id);
  let prioIconHTML = getPrioIconHTML(todo);
  let catColor = getCategoryColor(todo.category);

  dialog.innerHTML = generateTaskDialogHTML(
    todo,
    catColor,
    id,
    contactsListHTML,
    subtasksListHTML,
    prioIconHTML,
  );
}

/**
 * Closes the task detail dialog.
 *
 * @returns {void}
 */
function closeTaskDialog() {
  document.getElementById("taskDialog").close();
  updateHTML();
}

/**
 * Processes the contact data and creates the combined HTML string.
 *
 * @param {Object} todo - The current todo object from Firebase.
 */
function renderDialogContacts(todo) {
  if (!todo["assigned_contacts"] || todo["assigned_contacts"].length === 0)
    return "<p>No one assigned</p>";
  return todo["assigned_contacts"]
    .map((contact) => {
      let name = getAssignedContactName(contact);
      let color = contact.color || "#2A3647";
      let initials = getInitials(name);
      return generateDialogContactsHTML(name, color, initials);
    })
    .join("");
}

/**
 * Gets the name of the assigned contact, with a special case for the current user.
 *
 * @param {Object|string} contact - The contact object or name.
 * @return {string} The name of the assigned contact.
 */
function getAssignedContactName(contact) {
  let name;
  let user = getCurrentUser();

  if (user && user.name !== "Guest" && contact.name === user.name) {
    name = user.name + " (You)";
  } else {
    name = typeof contact === "string" ? contact : contact.name || "Unknown";
  }

  return name;
}

/**
 * Processes the subtask data and creates the combined HTML checkbox string.
 *
 * @param {Object} todo - The current todo object from Firebase.
 * @param {string} id - The ID of the parent task, used to uniquely identify the checkboxes for subtasks and link them to the correct task when toggling their status.
 */
function renderDialogSubtasks(todo, id) {
  if (!todo || !todo["subtasks"]) return "<p>No subtasks</p>";

  let subtasksArray = Array.isArray(todo["subtasks"])
    ? todo["subtasks"]
    : Object.values(todo["subtasks"]);

  if (subtasksArray.length === 0) return "<p>No subtasks</p>";

  return subtasksToReturn(subtasksArray, id);
}

/**
 * Converts a list of subtasks into the dialog checkbox HTML.
 *
 * @param {Array<Object|string>} subtasksArray - The subtasks to render.
 * @param {string} id - The parent task ID used to generate unique checkbox IDs.
 * @returns {string} The rendered HTML string for all subtask rows.
 */
function subtasksToReturn(subtasksArray, id) {
  return subtasksArray
    .map((subtask, index) => {
      let isChecked = subtask.done ? "checked" : "";

      let checkboxId = "subtask-" + id + index;
      return generateDialogSubtasksHTML(
        id,
        index,
        subtask.title,
        isChecked,
        checkboxId,
      );
    })
    .join("");
}

/**
 * Toggles the done status of a subtask and triggers the Firebase update.
 *
 * @param {string} todoId - The ID of the parent task containing the subtask.
 * @param {number} subtaskIndex - The index of the subtask to toggle within the parent task's subtasks array.
 */
async function toggleSubtask(todoId, subtaskIndex) {
  let todo = todos.find((t) => t.id === todoId);
  if (todo && todo.subtasks) {
    let subtasksArray = Array.isArray(todo.subtasks)
      ? todo.subtasks
      : Object.values(todo.subtasks);

    if (subtasksArray[subtaskIndex]) {
      subtasksArray[subtaskIndex].done = !subtasksArray[subtaskIndex].done;
      let isDone = subtasksArray[subtaskIndex].done;
      await saveSubtaskStatusToFirebase(todoId, subtaskIndex, isDone);
      updateHTML();
    }
  }
}

/**
 * Sends the updated task object containing the modified subtasks to Firebase.
 *
 * @param {Object} todo - The updated task object with the toggled subtask status, which will be sent to Firebase to persist the changes.
 */
async function saveSubtaskStatusToFirebase(todoId, subtaskIndex, isDone) {
  let url = BASE_URL + `tasks/${todoId}/subtasks/${subtaskIndex}/done.json`;
  await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(isDone),
  });
}

/**
 * Sends a PUT request to Firebase to update a specific task.
 *
 * @param {Object} task - The updated task object.
 */
async function updateTaskInFirebase(task) {
  let url = BASE_URL + `tasks/${task.id}.json`;
  await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

/**
 * Closes the dialog when clicking directly on the backdrop background.
 *
 * @param {*} - No parameters are required for this function as it directly interacts with the dialog element in the HTML to set up an event listener for clicks on the backdrop.
 */
function initDialogCloseOnClickOutside() {
  let dialog = document.getElementById("taskDialog");
  if (dialog)
    dialog.onclick = (e) => {
      if (e.target === dialog) dialog.close();
    };
}

/**
 * Generates HTML badges for assigned contacts (max 4, 5th becomes +X).
 * Returns an empty string if no contacts are assigned.
 *
 * @param {Object} todo - The current todo object from Firebase.
 * @return {string} The HTML string containing all profile badges or an empty string.
 */
function generateAssignedBadgesHTML(todo) {
  let assigned = todo["assigned_contacts"] || [];
  if (assigned.length === 0) return "";

  let contactsList = Array.isArray(assigned)
    ? assigned
    : Object.values(assigned);
  let renderedContacts = contactsList.slice(0, 4);
  let html = renderSingleBadges(renderedContacts);
  let extraCount = contactsList.length - 4;

  if (extraCount > 0) html += generateOverflowBadgeHTML(extraCount);
  return html;
}

/**
 * Renders individual badges for a list of contacts.
 *
 * @param {Array} contacts - The list of contacts for which to render badges.
 * @return {string} The HTML string containing all rendered badges.
 */
function renderSingleBadges(contacts) {
  return contacts
    .map((name) => {
      let initials = getTaskInitials(name);
      let color = name.color || getContactColor(name);
      return generateSingleBadgeHTML(initials, color);
    })
    .join("");
}

/**
 * Extracts the initials from a full name.
 *
 * @param {string} name - Full name of the contact.
 * @return {string} Initials (e.g. "MM").
 */
function getTaskInitials(name) {
  let words = name.name.trim().split(" ");
  let first = words[0] ? words[0].charAt(0).toUpperCase() : "";
  let last = words[1] ? words[1].charAt(0).toUpperCase() : "";
  return first + last || "?";
}
