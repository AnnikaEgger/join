
function generateTodoHTML(todo, catColor) {
    let progressBar = generateProgressBarHTML(todo);
    let badgesHTML = generateAssignedBadgesHTML(todo);
    let prioIconHTML = getPrioIconHTML(todo);

    return `<div draggable="true" aria-label="Draggable todo item" tabindex="0"
                onclick="openTaskDialog('${todo['id']}')"
                ontouchstart="startDragging(event, '${todo['id']}')" 
                ontouchmove="handleTouchMove(event)" 
                ontouchend="stopDragging(event)" 
                ondragstart="startDragging(event, '${todo['id']}')" 
                ondragend="stopDragging(event)" class="card">
                <span class="category-field" style="background-color: ${catColor}">${todo['category'] || 'User Story'}</span>
                <h3 class="card-text">${todo['title']}</h3>
                <p>${todo['description']}</p>
                ${progressBar}
                <div class="card-footer">
                    <div class="badge-container">${badgesHTML}</div>
                    ${prioIconHTML}
                </div>
             </div>`;
}

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

function generateTaskDialogHTML(todo, catColor, id) {
    let contactsListHTML = renderDialogContacts(todo);
    let subtasksListHTML = renderDialogSubtasks(todo, id);
    let prioIconHTML = getPrioIconHTML(todo);
    return `
        <div class="task-dialog-header">
            <span class="category-field-dialog" style="background-color: ${catColor}">${todo['category'] || 'User Story'}</span>
            <button class="close-task-dialog-btn" onclick="closeTaskDialog()">X</button>
        </div>
        <h1 class="dialog-task-title">${todo['title']}</h1>
        <p class="dialog-description">${todo['description'] || ''}</p>
        <div class="dialog-prio-date">
            <div class="dialog-prio-row"><p class="dialog-text-label">Due date:</p> ${todo['dueDate'] || 'No date'}</div>
            <div class="dialog-prio-row"><p class="dialog-text-label">Priority:</p> ${todo['priority'] || 'Low'} ${prioIconHTML}</div>
        </div>
        <div class="dialog-assigned-section">Assigned To:<div class="dialog-contacts-container">${contactsListHTML}</div></div>
        <div class="dialog-subtasks-section">Subtasks:<div class="dialog-subtasks-container">${subtasksListHTML}</div></div>`;
}

function generateDialogContactsHTML(name, color, initials) {
    return `
        <div class="dialog-contact-row">
            <span class="profile-badge" style="background-color: ${color}">${initials}</span>
            <span class="dialog-contact-name">${name}</span>
        </div>`;
}

function generateDialogSubtasksHTML(todoId, index, title, isChecked) {
    let iconSrc = isChecked ? '/assets/icons/checkbox.svg' : '/assets/icons/checkbox-rect.svg';
    return `
        <div class="dialog-subtask-row" onclick="toggleSubtask('${todoId}', ${index})">
            <img src="${iconSrc}" class="dialog-subtask-checkbox" alt="checkbox">
            <label>${title}</label>
        </div>`;
}

function generatePrioIconHTML(src, prio) {
    return `<img src="${src}" alt="${prio} priority icon">`;
}

function generateEmptySectionHTML(category) {
    return `
        <div class="empty-card-container">
            <p>${category}</p>
        </div>
    `;
}

function generateSingleBadgeHTML(initials, color) {
    return `<span class="profile-badge" style="background-color: ${color}">${initials}</span>`;
}

function generateOverflowBadgeHTML(count) {
    return `<span class="profile-badge-plus">+${count}</span>`;
}

function generateEmptyBadgeHTML() {
    return '<span class="profile-badge">--</span>';
}