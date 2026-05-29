let todos = [/* {
    'id': 0,
    'title': 'dialog',
    'description': 'with a nice',
    'category': 'toDo'
}, {
    'id': 1,
    'title': 'footer',
    'description': 'make the footer shiny and nice',
    'column': 'inProgress'
}, {
    'id': 2,
    'title': 'headline',
    'description': 'make the headline wow',
    'column': 'awaitFeedback'
}, {
    'id': 3,
    'title': 'main content',
    'description': 'write the main content for the page and make it look good',
    'column': 'done'
} */
];

let currentDraggedElement;

/**
 * Loads tasks from Firebase, fills the `todos` array, and updates the HTML to display the tasks on the board. This function is called when the board page is initialized to fetch the latest tasks and render them accordingly.
 * 
 * @param {*} - No parameters are required for this function as it directly interacts with the global `todos` array and updates the HTML content of the board.
 */
async function loadTasks() {
    todos = [];
    let response = await fetch("https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/tasks.json");
    let data = await response.json();

    if (data) {
        fillTasksArray(data);
    }
    initDialogCloseOnClickOutside()
    updateHTML();
}

/**
 * Fills the `todos` array with tasks from the Firebase data.
 * 
 * @param {*} tasksObj - The object containing tasks from Firebase.
 */
function fillTasksArray(tasksObj) {
    let keys = Object.keys(tasksObj);

    for (let i = 0; i < keys.length; i++) {
        let id = keys[i];
        let taskData = tasksObj[id];
        taskData.id = id;
        todos.push(taskData);
    }
}

/**
 * This function updates the HTML of the board by rendering each category of tasks based on the current state of the `todos` array. It calls the `renderCategory` function for each category, passing the appropriate parameters to display the tasks and handle search functionality.
 * 
 * @param {*} - No parameters are required for this function as it relies on the global `todos` array and the search input value to update the HTML content of the board.
 */
function updateHTML() {
    renderCategory('to do', 'to do', 'No tasks To do');
    renderCategory('in progress', 'in progress', 'No tasks in progress');
    renderCategory('await feedback', 'await feedback', 'No tasks awaiting feedback');
    renderCategory('done', 'done', 'No tasks done');
}

/**
 * Renders the tasks for a specific column in the board.
 * 
 * @param {parameter} column - The column of tasks to render.
 * @param {parameter} containerId - The ID of the container where tasks will be displayed.
 * @param {parameter} message - The message to display if no tasks are found for the column.
 */
function renderCategory(column, containerId, message) {
    let search = document.getElementById('search-input').value.toLowerCase();
    let container = document.getElementById(containerId);

    let filtered = todos.filter(t => t.column == column &&
        (t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search)));

    if (search.length > 0 && filtered.length == 0) {
        container.parentElement.style.display = 'none';
    } else {
        container.parentElement.style.display = 'flex';
        container.innerHTML = filtered.length ? '' : generateEmptySectionHTML(message);
        filtered.forEach(t => {
            let catColor = getCategoryColor(t.category);
            container.innerHTML += generateTodoHTML(t, catColor);
        });
    }
    checkSearchNoMatches(search);
}

/**
 * Returns the color for a given category.
 * 
 * @param {parameter} category - The category for which to return a color.
 * @returns {string} The color for the given category.
 */
function getCategoryColor(category) {
    if (!category) return 'gray';
    let cat = category.toLowerCase();
    if (cat.includes('story') || cat.includes('user')) return '#0038FF';
    if (cat.includes('technical') || cat.includes('task')) return '#1FD7C1';
    if (cat.includes('bug')) return '#FF1A1A';
    return '#FF7A00';
}

/**
 * Calculates subtask metrics and requests the progress bar HTML.
 * 
 * @param {Object} todo - The current todo object from Firebase.
 * @return {string} The HTML string or an empty string.
 */
function generateProgressBarHTML(todo) {
    let subtasks = todo['subtasks'] || [];
    if (subtasks.length === 0) return '';

    let subtaskList = Array.isArray(subtasks) ? subtasks : Object.values(subtasks);
    let done = subtaskList.filter(s => s.status === 'done' || s.done === true).length;
    let total = subtaskList.length;
    let percentage = (done / total) * 100;

    return generateProgressHTML(done, total, percentage);
}

/**
 * Generates HTML badges for assigned contacts (max 4, 5th becomes +X).
 * 
 * @param {Object} todo - The current todo object from Firebase.
 * @return {string} The HTML string containing all profile badges.
 */
function generateAssignedBadgesHTML(todo) {
    let assigned = todo['assigned_contacts'] || [];
    if (assigned.length === 0) return generateEmptyBadgeHTML();

    let contactsList = Array.isArray(assigned) ? assigned : Object.values(assigned);
    let renderedContacts = contactsList.slice(0, 4);
    let extraCount = contactsList.length - 4;

    let html = renderedContacts.map(name => {
        let initials = getTaskInitials(name);
        let color = name.color || getContactColor(name);
        return generateSingleBadgeHTML(initials, color);
    }).join('');

    if (extraCount > 0) html += generateOverflowBadgeHTML(extraCount);
    return html;
}

/**
 * Extracts the initials from a full name.
 * 
 * @param {string} name - Full name of the contact.
 * @return {string} Initials (e.g. "MM").
 */
function getTaskInitials(name) {
    let words = name.name.trim().split(' ');
    let first = words[0] ? words[0].charAt(0).toUpperCase() : '';
    let last = words[1] ? words[1].charAt(0).toUpperCase() : '';
    return (first + last) || '?';
}

/**
 * Generates a consistent background color based on the contact's name.
 * 
 * @param {string} name - Name of the contact.
 * @return {string} Hex color string.
 */
function getContactColor(name) {
    let colors = ['#FF7A00', '#6E52FF', '#9327FF', '#00BEE8', '#FF745E', '#FFA800'];
    let index = (name.name.charCodeAt(0) || 0) % colors.length;
    return colors[index];
}

/**
 * Determines the correct priority icon path and gets the HTML string.
 * 
 * @param {Object} todo - The current todo object from Firebase.
 * @return {string} HTML string of the image tag.
 */
function getPrioIconHTML(todo) {
    let prio = (todo['priority'] || 'low').toLowerCase();
    let src = `../assets/icons/${prio}-prio-icon.svg`;

    if (prio === 'urgent' || prio === 'hoch') src = '../assets/icons/urgent-prio-icon.svg';
    if (prio === 'medium' || prio === 'mittel') src = '../assets/icons/medium-prio-icon-2.svg';

    return generatePrioIconHTML(src, prio);
}

/**
 * Checks if the search results match any tasks.
 * 
 * @param {parameter} search - The search term.
 */
function checkSearchNoMatches(search) {
    let anyMatch = todos.some(t => t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search));
    let msg = document.getElementById('search-message');
    if (msg) msg.innerHTML = (!anyMatch && search.length > 0) ? 'no tasks found.' : '';
}

/**
 * Generates the HTML for an empty section when no tasks are found.
 * 
 * @param {parameter} message - The message to display in the empty section.
 */
function filterTasks() {
    updateHTML();
}

/**
 * Opens the task detail dialog and fills it with the dynamic Firebase data.
 * 
 * @param {parameter} id - The ID of the task to display in the dialog, used to find the corresponding task in the `todos` array and populate the dialog with its details.
 */
function openTaskDialog(id) {
    let todo = todos.find(t => t.id === id);
    if (!todo) return;

    let dialog = document.getElementById('taskDialog');
    let catColor = getCategoryColor(todo.category);
    dialog.innerHTML = generateTaskDialogHTML(todo, catColor, id);
    dialog.showModal();
}

/**
 * Closes the task detail dialog.
 * 
 * @param {parameter} - No parameters are required for this function as it simply closes a predefined dialog element in the HTML.
 */
function closeTaskDialog() {
    document.getElementById('taskDialog').close();
}

/**
 * Processes the contact data and creates the combined HTML string.
 * 
 * @param {Object} todo - The current todo object from Firebase.
 */
function renderDialogContacts(todo) {
    if (!todo['assigned_contacts'] || todo['assigned_contacts'].length === 0) return '<p>No one assigned</p>';
    return todo['assigned_contacts'].map(contact => {
        let name = typeof contact === 'string' ? contact : (contact.name || 'Unknown');
        let color = contact.color || '#2A3647';
        let initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        return generateDialogContactsHTML(name, color, initials);
    }).join('');
}

/**
 * Processes the subtask data and creates the combined HTML checkbox string.
 * 
 * @param {Object} todo - The current todo object from Firebase.
 * @param {string} id - The ID of the parent task, used to uniquely identify the checkboxes for subtasks and link them to the correct task when toggling their status.
 */
function renderDialogSubtasks(todo, id) {
    if (!todo || !todo['subtasks']) return '<p>No subtasks</p>';
    let subtasksArray = Array.isArray(todo['subtasks']) ? 
        todo['subtasks'] : Object.values(todo['subtasks']);
    if (subtasksArray.length === 0) return '<p>No subtasks</p>';
    return subtasksArray.map((subtask, index) => {
        let isChecked = subtask.done ? 'checked' : '';
        let title = typeof subtask === 'string' ? subtask : 
            (subtask.title || subtask.name || subtask.text || 'Subtask');
        return generateDialogSubtasksHTML(id, index, title, isChecked);
    }).join('');
}

/**
 * Toggles the done status of a subtask and triggers the Firebase update.
 * 
 * @param {string} todoId - The ID of the parent task containing the subtask.
 * @param {number} subtaskIndex - The index of the subtask to toggle within the parent task's subtasks array.
 */
function toggleSubtask(todoId, subtaskIndex) {
    let todo = todos.find(t => t.id === todoId);
    if (todo && todo.subtasks) {
        let subtasksArray = Array.isArray(todo.subtasks) ? 
            todo.subtasks : Object.values(todo.subtasks);
        if (subtasksArray[subtaskIndex]) {
            subtasksArray[subtaskIndex].done = !subtasksArray[subtaskIndex].done;
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
    let url = `https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/tasks/${todoId}/subtasks/${subtaskIndex}/done.json`;
    await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isDone)
    });
}

let touchTimeout;
let isLongPress = false;
let startX, startY;

/**
 * Handles the start of a touch event, preparing for a long press detection.
 * 
 * @param {parameter} event - The touch event.
 * @param {parameter} id - The ID of the task to drag.
 */
function startDragging(event, id) {
    currentDraggedElement = id;
    let card = event.target.closest('.card');
    if (event.type === 'touchstart') {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        isLongPress = false;
        touchTimeout = setTimeout(() => {
            isLongPress = true;
            if (card) { card.classList.add('dragging'); card.style.pointerEvents = 'none'; }
            if (navigator.vibrate) navigator.vibrate(50);
        }, 200);
    } else if (card) {
        card.classList.add('dragging');
    }
}

/**
 * Allows a drop effect during native HTML5 desktop drag and drop operations.
 * 
 * @param {parameter} ev - The drag over event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Moves the card with the finger and handles automatic page scrolling and column highlighting.
 * 
 * @param {parameter} event - The touch move event.
 */
function handleTouchMove(event) {
    let touch = event.touches ? event.touches[0] : null;
    if (!isLongPress || !touch) {
        if (touch && (Math.abs(touch.clientX - startX) > 10 || Math.abs(touch.clientY - startY) > 10)) {
            clearTimeout(touchTimeout);
        }
        return;
    }
    event.preventDefault();
    let card = event.target.closest('.card');
    if (card) {
        card.style.position = 'fixed';
        card.style.left = `${touch.clientX - (card.offsetWidth / 2)}px`;
        card.style.top = `${touch.clientY - (card.offsetHeight / 2)}px`;
        checkAutoScroll(touch.clientY);
        handleMobileHighlight(touch.clientX, touch.clientY);
    }
}

/**
 * Manually highlights the column container under the user's finger on mobile devices.
 * 
 * @param {number} x - The current horizontal position of the finger.
 * @param {number} y - The current vertical position of the finger.
 */
function handleMobileHighlight(x, y) {
    let element = document.elementFromPoint(x, y);
    let currentContainer = element ? element.closest('.card-container') : null;

    document.querySelectorAll('.card-container').forEach(c => c.classList.remove('drag-area-highlight'));

    if (currentContainer && currentContainer.id) {
        currentContainer.classList.add('drag-area-highlight');
    }
}

/**
 * Automatically scrolls the window when the finger is near the top or bottom edge.
 * 
 * @param {number} clientY - The current vertical position of the finger.
 */
function checkAutoScroll(clientY) {
    let speed = 90;
    let threshold = 100;

    if (clientY < threshold) {
        window.scrollBy(0, -speed);
    } else if (clientY > (window.innerHeight - threshold)) {
        window.scrollBy(0, speed);
    }
}

/**
 * Handles the end of a touch event and triggers the drop logic.
 * 
 * @param {parameter} event - The touch end event.
 */
function stopDragging(event) {
    clearTimeout(touchTimeout);
    document.querySelectorAll('.card-container').forEach(c => c.classList.remove('drag-area-highlight'));

    event.target.classList.remove('dragging');
    let card = event.target.closest('.card');
    if (card) card.style.position = '';

    if (event.type === 'touchend' && isLongPress) {
        let touch = event.changedTouches[0];
        let element = document.elementFromPoint(touch.clientX, touch.clientY);
        let columnContainer = element ? element.closest('.card-container') : null;
        if (columnContainer) moveTo(columnContainer.id);
    }
}

/**
 * Moves a task to a different column and updates Firebase.
 * 
 * @param {string} column - The target column.
 */
function moveTo(column) {
    let task = todos.find(t => t.id === currentDraggedElement);
    if (task) {
        task['column'] = column;
        updateHTML();
        updateTaskInFirebase(task);
    }
}

/**
 * Sends a PUT request to Firebase to update a specific task.
 * 
 * @param {Object} task - The updated task object.
 */
async function updateTaskInFirebase(task) {
    let url = `https://join-50921-default-rtdb.europe-west1.firebasedatabase.app/tasks/${task.id}.json`;
    await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}

/**
 * Closes the dialog when clicking directly on the backdrop background.
 * 
 * @param {*} - No parameters are required for this function as it directly interacts with the dialog element in the HTML to set up an event listener for clicks on the backdrop.
 */
function initDialogCloseOnClickOutside() {
    let dialog = document.getElementById('taskDialog');
    if (dialog) dialog.onclick = (e) => { if (e.target === dialog) dialog.close(); };
}

/**
 * Highlights a drag area.
 * 
 * @param {parameter} id - The ID of the drag area to highlight.
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

/**
 * Removes the highlight from a drag area.
 * 
 * @param {parameter} id - The ID of the drag area to remove the highlight from.
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

/**
 * Opens the dialog for adding a new task.
 * 
 * @param {parameter} - No parameters are required for this function as it simply opens a predefined dialog element in the HTML.
 */
function openAddTaskDialog() {
    document.getElementById('addTaskDialog').showModal();
}

/**
 * Closes the dialog for adding a new task.
 * 
 * @param {parameter} - No parameters are required for this function as it simply closes a predefined dialog element in the HTML.
 */
function closeAddTaskDialog() {
    document.getElementById('addTaskDialog').close();
}