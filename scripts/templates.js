
function generateTodoHTML(todo, catColor) {
    let progressBar = generateProgressBarHTML(todo);
    let badgesHTML = generateAssignedBadgesHTML(todo);
    let prioIconHTML = getPrioIconHTML(todo);

    return `<div draggable="true" aria-label="Draggable todo item" tabindex="0" 
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