let subtasksArr = [];
let skipFocusoutRender = false;

/**
 * Clears the subtask input field and refocuses it.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function clearSubtaskInput(id) {
  const SUBTASK_INPUT_REF = document.getElementById("subtask-input" + id);
  SUBTASK_INPUT_REF.value = "";
  SUBTASK_INPUT_REF.focus();
}

/**
 * Adds a new subtask from the input field to the subtasks array and re-renders.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function addSubtask(id) {
  const SUBTASK_INPUT = document.getElementById("subtask-input" + id).value;
  const subtaskObj = {
    title: SUBTASK_INPUT,
    done: false,
  };
  if (SUBTASK_INPUT.trim().length > 0) {
    subtasksArr.push({ ...subtaskObj });
    renderSubtasks(id);
    clearSubtaskInput(id);
  }
}

/**
 * Renders all subtasks in the subtask list with edit and delete handlers.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function renderSubtasks(id) {
  const SUBTASK_UL = document.getElementById("subtask-list" + id);
  const SUBTASK_INPUT_REF = document.getElementById("subtask-input" + id);
  SUBTASK_UL.innerHTML = "";
  if (subtasksArr.length === 0) return;
  for (let index = 0; index < subtasksArr.length; index++) {
    SUBTASK_UL.innerHTML += subtaskLiTemplate(subtasksArr[index], index, id);
    registerEnterHandler("#subtask-li-" + index + id, () => {
      openSubtaskEdit(index, id);
    });
  }
}

/**
 * Re-renders a single subtask after editing.
 * @param {number} indexSubtask - The index of the subtask to render
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function renderSingleSubtask(indexSubtask, id) {
  let li = document.getElementById("subtask-li-" + indexSubtask + id);
  if (!subtasksArr[indexSubtask]) return;
  li.outerHTML = subtaskLiTemplate(subtasksArr[indexSubtask], indexSubtask, id);
  registerEnterHandler("#subtask-li-" + indexSubtask + id, () => {
    openSubtaskEdit(indexSubtask, id);
  });
}

/**
 * Opens a subtask for editing by replacing it with an input field.
 * @param {number} indexSubtask - The index of the subtask to edit
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function openSubtaskEdit(indexSubtask, id) {
  const li = document.getElementById("subtask-li-" + indexSubtask + id);
  li.outerHTML = subtaskLiWithInputTemplate(indexSubtask, id);
  registerEnterHandler("#li-input" + indexSubtask + id, () => {
    submitEditedSubtask(indexSubtask, id);
  });
  addSubtaskEditEventListener(indexSubtask, id);
  focusSubtaskEditInput(indexSubtask, id);
}

/**
 * Submits the edited subtask, updating or deleting it as needed.
 * @param {number} indexSubtask - The index of the subtask being edited
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function submitEditedSubtask(indexSubtask, id) {
  let edit = document.getElementById("li-input" + indexSubtask + id).value;
  if (edit.trim().length > 0) {
    subtasksArr.splice(indexSubtask, 1, { title: edit, done: false });
    skipFocusoutRender = true;
    renderSingleSubtask(indexSubtask, id);
    skipFocusoutRender = false;
  } else if (edit.length === 0) {
    deleteSubtask(indexSubtask, id);
  }
}

/**
 * Deletes a subtask from the array and re-renders the list.
 * @param {number} indexSubtask - The index of the subtask to delete
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function deleteSubtask(indexSubtask, id) {
  subtasksArr.splice(indexSubtask, 1);
  renderSubtasks(id);
}

/**
 * Focuses the subtask edit input and places the cursor at the end.
 * @param {number} indexSubtask - The index of the subtask
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function focusSubtaskEditInput(indexSubtask, id) {
  let input = document.getElementById("li-input" + indexSubtask + id);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

/**
 * Adds a focusout event listener to a subtask edit element.
 * @param {number} indexSubtask - The index of the subtask
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function addSubtaskEditEventListener(indexSubtask, id) {
  let li = document.getElementById("subtask-li-" + indexSubtask + id);
  li.addEventListener("focusout", (event) => {
    if (li.contains(event.relatedTarget)) return;
    if (skipFocusoutRender) return;
    renderSingleSubtask(indexSubtask, id);
  });
}