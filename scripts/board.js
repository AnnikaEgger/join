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
    renderCategory('to do', 'toDo', 'No tasks To do');
    renderCategory('in progress', 'inProgress', 'No tasks in progress');
    renderCategory('await feedback', 'awaitFeedback', 'No tasks awaiting feedback');
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
 * Starts dragging a task and adds a visual effect to indicate that the task is being dragged.
 * 
 * @param {parameter} event - The drag event.
 * @param {parameter} id - The ID of the task to drag.
 */
function startDragging(event, id) {
    currentDraggedElement = id;
    event.target.classList.add('dragging');
}

/**
 * Stops dragging a task and removes the visual effect.
 * 
 * @param {parameter} event - The drag event.
 */
function stopDragging(event) {
    event.target.classList.remove('dragging');
}

/**
 * Allows dropping of a dragged element.
 * 
 * @param {parameter} ev - The drag event.
 */
function allowDrop(ev) {
    ev.preventDefault();
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