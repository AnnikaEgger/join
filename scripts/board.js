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

function updateHTML() {
    renderCategory('toDo', 'toDo', 'To Do');
    renderCategory('inProgress', 'inProgress', 'In Progress');
    renderCategory('awaitFeedback', 'awaitFeedback', 'Await Feedback');
    renderCategory('done', 'done', 'Done');
}

function renderCategory(category, containerId, label) {
    let search = document.getElementById('search-input').value.toLowerCase();
    let container = document.getElementById(containerId);
    let filtered = todos.filter(t => t.category == category && 
        (t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search)));

    if (search.length > 0 && filtered.length == 0) {
        container.parentElement.style.display = 'none';
    } else {
        container.parentElement.style.display = 'flex';
        container.innerHTML = filtered.length ? '' : generateEmptySectionHTML(label);
        filtered.forEach(t => container.innerHTML += generateTodoHTML(t));
    }
    checkSearchNoMatches(search);
}

function checkSearchNoMatches(search) {
    let anyMatch = todos.some(t => t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search));
    let msg = document.getElementById('search-message');
    if (msg) msg.innerHTML = (!anyMatch && search.length > 0) ? 'nothing found.' : '';
}

function filterTasks() {
    updateHTML();
}

function startDragging(id) {
    currentDraggedElement = id;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function moveTo(category) {
    todos[currentDraggedElement]['category'] = category;
    updateHTML();
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

function openAddTaskDialog() {
    document.getElementById('addTaskDialog').showModal();
}

function closeAddTaskDialog() {
    document.getElementById('addTaskDialog').close();
}