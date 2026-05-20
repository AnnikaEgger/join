
function generateTodoHTML(element) {
    return `<div draggable="true" ondragstart="startDragging(event, ${element['id']})" ondragend="stopDragging(event)" class="card">
                <span class="category-field">User Story</span>
                            <h3 class="card-text">${element['title']}</h3>
                            <p>${element['description']}</p>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-bar-fill" style="width: 50%;"></div>
                                </div>
                                <label class="progress-label" for="progressBar">1/2 Subtasks</label>
                            </div>
                            <div class="card-footer">
                                <div class="badge-container">
                                    <span class="profile-badge">LW</span>
                                    <span class="profile-badge-2">AE</span>
                                    <span class="profile-badge-3">CN</span>
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