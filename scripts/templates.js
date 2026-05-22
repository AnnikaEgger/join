
function generateTodoHTML(todo) {
    return `<div draggable="true" ondragstart="startDragging(event, '${todo['id']}')" ondragend="stopDragging(event)" class="card">
                <span class="category-field">${todo['category']}</span>
                            <h3 class="card-text">${todo['title']}</h3>
                            <p>${todo['description']}</p>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-bar-fill" style="width: 50%;"></div>
                                </div>
                                <label class="progress-label" for="progressBar">1/2 Subtasks</label>
                            </div>
                            <div class="card-footer">
                                <div class="badge-container">
                                    <span class="profile-badge">${todo['assignedTo'] || 'Unassigned'}</span>
                                    <span class="profile-badge-2">${todo['assignedTo'] || 'Unassigned'}</span>
                                    <span class="profile-badge-3">${todo['assignedTo'] || 'Unassigned'}</span>
                                </div>
                                <img src="../assets/icons/low-prio-icon.svg" alt="low priority icon">
                            </div>
                         </div>`;
}

function generateEmptySectionHTML(category) {
    return `
        <div class="empty-card-container">
            <p>${category}</p>
        </div>
    `;
}