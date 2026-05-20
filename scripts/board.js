let todos = [{
    'id': 0,
    'title': 'dialog',
    'description': 'with a nice',
    'category': 'toDo'
}, {
    'id': 1,
    'title': 'footer',
    'description': 'make the footer shiny and nice',
    'category': 'inProgress'
}, {
    'id': 2,
    'title': 'headline',
    'description': 'make the headline wow',
    'category': 'awaitFeedback'
}, {
    'id': 3,
    'title': 'main content',
    'description': 'write the main content for the page and make it look good',
    'category': 'done'
}
];

let currentDraggedElement;

/**
 * This function updates the HTML of the board by rendering each category of tasks based on the current state of the `todos` array. It calls the `renderCategory` function for each category, passing the appropriate parameters to display the tasks and handle search functionality.
 * 
 * @param {*} - No parameters are required for this function as it relies on the global `todos` array and the search input value to update the HTML content of the board.
 */
function updateHTML() {
    renderCategory('toDo', 'toDo', 'No tasks To do');
    renderCategory('inProgress', 'inProgress', 'No tasks in progress');
    renderCategory('awaitFeedback', 'awaitFeedback', 'No tasks awaiting feedback');
    renderCategory('done', 'done', 'No tasks done');
}

/**
 * Renders the tasks for a specific category in the board.
 * 
 * @param {parameter} category - The category of tasks to render.
 * @param {parameter} containerId - The ID of the container where tasks will be displayed.
 * @param {parameter} message - The message to display if no tasks are found for the category.
 */
function renderCategory(category, containerId, message) {
    let search = document.getElementById('search-input').value.toLowerCase();
    let container = document.getElementById(containerId);
    let filtered = todos.filter(t => t.category == category &&
        (t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search)));

    if (search.length > 0 && filtered.length == 0) {
        container.parentElement.style.display = 'none';
    } else {
        container.parentElement.style.display = 'flex';
        container.innerHTML = filtered.length ? '' : generateEmptySectionHTML(message);
        filtered.forEach(t => container.innerHTML += generateTodoHTML(t));
    }
    checkSearchNoMatches(search);
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
 * Moves a task to a different category.
 * 
 * @param {parameter} category - The category to move the task to.
 */
function moveTo(category) {
    todos[currentDraggedElement]['category'] = category;
    updateHTML();
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