let todos = [{
    /*     'id': 0,
        'title': '',
        'description': '',
        'category': 'toDo' */
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
    let filtered = todos.filter(t => t['category'] == category);
    let container = document.getElementById(containerId);
    container.innerHTML = '';

    if (filtered.length == 0) {
        container.innerHTML = generateEmptySectionHTML(label);
    } else {
        for (let index = 0; index < filtered.length; index++) {
            container.innerHTML += generateTodoHTML(filtered[index]);
        }
    }
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