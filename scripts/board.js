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
    let toDo = todos.filter(t => t['category'] == 'toDo');

    document.getElementById('toDo').innerHTML = '';

    for (let index = 0; index < toDo.length; index++) {
        const element = toDo[index];
        document.getElementById('toDo').innerHTML += generateTodoHTML(element);
    }

    let inProgress = todos.filter(t => t['category'] == 'inProgress');

    document.getElementById('inProgress').innerHTML = '';

    for (let index = 0; index < inProgress.length; index++) {
        const element = inProgress[index];
        document.getElementById('inProgress').innerHTML += generateTodoHTML(element);
    }

    let awaitFeedback = todos.filter(t => t['category'] == 'awaitFeedback');

    document.getElementById('awaitFeedback').innerHTML = '';

    for (let index = 0; index < awaitFeedback.length; index++) {
        const element = awaitFeedback[index];
        document.getElementById('awaitFeedback').innerHTML += generateTodoHTML(element);
    }

    let done = todos.filter(t => t['category'] == 'done');

    document.getElementById('done').innerHTML = '';

    for (let index = 0; index < done.length; index++) {
        const element = done[index];
        document.getElementById('done').innerHTML += generateTodoHTML(element);
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