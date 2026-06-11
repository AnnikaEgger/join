const enterHandlers = new Map();
let successfullSubmit;

/**
 * Registers a keyboard handler for a specific element selector.
 * @param {string} selector - The CSS selector to match
 * @param {() => void} handler - The callback function to execute on Enter key
 * @returns {void}
 */
function registerEnterHandler(selector, handler) {
  enterHandlers.set(selector, handler);
}

/**
 * Registers all Enter key handlers for form elements and dropdowns.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function registerEnterHandlers(id) {
  registerEnterHandler("#custom-select-trigger-contacts" + id, async () => {
    await toggleCustomSelectDropdown("contacts", id);
  });
  contactOptionsEnterHandlers(id);
  contactOptionsCheckboxesEnterHandlers(id);
  registerEnterHandler("#custom-select-trigger-category" + id, async () => {
    await toggleCustomSelectDropdown("category", id);
  });
  categoryOptionsEnterHandlers(id);
  registerEnterHandler("#subtask-input" + id, () => addSubtask(id));
}

/**
 * Registers Enter key handlers for all contact options in the dropdown.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function contactOptionsEnterHandlers(id) {
  let contactOptions = document.querySelectorAll(".contact-option");
  contactOptions.forEach((option) => {
    registerEnterHandler(
      "#contact-option-" + option.dataset.indexContact + id,
      () => {
        selectContact(
          option.dataset.indexContact,
          filteredContacts[option.dataset.indexContact].id,
          false,
          id,
        );
      },
    );
  });
}

/**
 * Registers Enter key handlers for all contact option checkboxes in the dropdown.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function contactOptionsCheckboxesEnterHandlers(id) {
  let contactOptionsCheckboxes = document.querySelectorAll(
    ".contact-option-checkbox",
  );
  contactOptionsCheckboxes.forEach((checkbox) => {
    registerCheckboxesEnterHandlers(checkbox, id);
  });
}

/**
 * Registers an Enter key handler for a specific contact checkbox element.
 * @param {HTMLInputElement} checkbox - The checkbox element containing data attributes
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function registerCheckboxesEnterHandlers(checkbox, id) {
  registerEnterHandler("#checkbox" + checkbox.dataset.indexContact + id, () => {
    selectContact(
      checkbox.dataset.indexContact,
      filteredContacts[checkbox.dataset.indexContact].id,
      false,
      id,
    );
  });
}

/**
 * Registers Enter key handlers for all category options in the dropdown.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function categoryOptionsEnterHandlers(id) {
  let categoryOptions = document.querySelectorAll(".category-option");
  categoryOptions.forEach((option) => {
    registerEnterHandler(
      "#category-option-" + option.dataset.indexCategory + id,
      () => {
        selectCategory(categoriesArr[option.dataset.indexCategory].title, id);
      },
    );
  });
}

/**
 * Attaches event listeners to form and dropdown elements.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function addEventListeners(id) {
  const taskForm = document.getElementById("task-form" + id);
  addTaskFormEventListeners(id);
  addContactsDropdownEventListener(id);
  if (id === "--edit-task") return;
  addCategoriesDropdownEventListener(id);
}

/**
 * Attaches focusout listeners to the contacts dropdown.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function addContactsDropdownEventListener(id) {
  const contactsDropdown = document.getElementById("contacts-dropdown" + id);
  contactsDropdown.addEventListener("focusout", (event) =>
    contactsDropdownFocusOutFunction(event, id),
  );
}

/**
 * Attaches focusout listeners to the categories dropdown.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function addCategoriesDropdownEventListener(id) {
  const categoriesDropdown = document.getElementById(
    "categories-dropdown" + id,
  );
  categoriesDropdown.addEventListener("focusout", (event) =>
    categoriesDropdownFocusOutFunction(event, id),
  );
}

/**
 * Adds submit and keydown listeners to the task form.
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function addTaskFormEventListeners(id) {
  const taskForm = document.getElementById("task-form" + id);
  taskForm.addEventListener("keydown", taskFormKeydownFunction);
  taskForm.addEventListener("submit", (event) =>
    taskFormSubmitFunction(event, id),
  );
}

/**
 * Handles keydown events in the task form, triggering registered handlers on Enter key.
 * @param {KeyboardEvent} event - The keyboard event
 * @returns {void}
 */
function taskFormKeydownFunction(event) {
  if (event.key !== "Enter") return;
  const el = event.target;
  let continueFunction = handleKeyDownElement(el);
  if (!continueFunction) return;
  event.preventDefault();
  for (const [selector, handler] of enterHandlers) {
    if (el.matches(selector)) {
      handler();
      break;
    }
  }
}

/**
 * Determines if the keydown event should trigger a handler based on the element type.
 * @param {HTMLElement} el - The element that triggered the event
 * @returns {boolean} True if the handler should proceed, false otherwise
 */
function handleKeyDownElement(el) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.tagName === "BUTTON") return false;
  if (el.tagName === "TEXTAREA") return false;
  if (
    el.tagName === "INPUT" &&
    el.id !== "search-contact-input" &&
    el.id !== "subtask-input" &&
    !el.id.startsWith("li-input") &&
    !el.id.startsWith("checkbox")
  ) {
    el.blur();
  }
  return true;
}

/**
 * Validates the task form submission and delegates invalid cases to the error handler.
 * @param {Event} event - The submit event object.
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @returns {void}
 */
function taskFormSubmitFunction(event, id) {
  const taskForm = event.target;

  if (id === "--add-task" || id === "--add-task-dialog") {
    taskFormSubmitFunctionAddTask(taskForm, id);
  } else if (id === "--edit-task") {
    taskFormSubmitFunctionEditTask(taskForm, id);
  }
}

/**
 * Validates the add-task form submission and marks the form as successfully submitted when valid.
 *
 * @param {HTMLFormElement} taskForm - The task form element to validate.
 * @param {string} id - The current form identifier suffix.
 * @returns {void}
 */
function taskFormSubmitFunctionAddTask(taskForm, id) {
  const formIsValid = taskForm.checkValidity();
  const categoryIsValid = selectedCategory !== "Select task category";

  if (!formIsValid || !categoryIsValid) {
    handleInvalidSubmit(
      event,
      formIsValid,
      taskForm,
      id,
      categoryIsValid,
      undefined,
    );
  } else if (formIsValid && categoryIsValid) {
    successfullSubmit = true;
  }
}

/**
 * Validates the edit-task form submission and checks the due date before allowing the update flow.
 *
 * @param {HTMLFormElement} taskForm - The edit task form element.
 * @param {string} id - The current form identifier suffix.
 * @returns {void}
 */
function taskFormSubmitFunctionEditTask(taskForm, id) {
  const DATE_INPUT = document.getElementById("task-due-date--edit-task");
  DATE_INPUT.disabled = true;
  const formIsValid = taskForm.checkValidity();
  DATE_INPUT.disabled = false;
  const validDate = DATE_INPUT.value !== "";

  if (!formIsValid || !validDate) {
    handleInvalidSubmit(event, formIsValid, taskForm, id, undefined, validDate);
  } else if (formIsValid && validDate) {
    successfullSubmit = true;
  }
}
//

/**
 * Handles an invalid task submission by preventing the default submit action,
 * marking the form as unsuccessful, and applying validation styling.
 * @param {Event} event - The submit event object
 * @param {boolean} formIsValid - Indicates whether the form fields pass native validation.
 * @param {HTMLFormElement} taskForm - The form element being submitted.
 * @param {string} id - The identifier suffix for the current form or dialog instance.
 * @param {boolean} categoryIsValid - Indicates whether a valid category has been selected.
 * @returns {void}
 */
function handleInvalidSubmit(
  event,
  formIsValid,
  taskForm,
  id,
  categoryIsValid,
  validDate,
) {
  event.preventDefault();
  successfullSubmit = false;
  if (!formIsValid || validDate === false) {
    addInvalidClasses(taskForm, id, validDate);
  }
  if (id === "--edit-task") return;
  handleInvalidCategory(formIsValid, categoryIsValid, id, taskForm);
}

/**
 * Processes validation specifically for the task category dropdown when submitting.
 * @param {boolean} formIsValid - Indicates whether the form fields pass native validation
 * @param {boolean} categoryIsValid - Indicates whether a valid category has been selected
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @param {HTMLFormElement} taskForm - The form element being submitted
 * @returns {void}
 */
function handleInvalidCategory(formIsValid, categoryIsValid, id, taskForm) {
  if (!categoryIsValid) {
    addCategoryClasses(taskForm, id);
  }
  if (formIsValid && !categoryIsValid) {
    const categoryTrigger = taskForm.querySelector(
      "#custom-select-trigger-category" + id,
    );
    focusInvalidElement(categoryTrigger, taskForm);
  }
}

/**
 * Marks invalid form fields with error styling and focuses the first invalid element.
 * @param {HTMLFormElement} taskForm - The form being validated
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function addInvalidClasses(taskForm, id, validDate) {
  const invalidElements = taskForm.querySelectorAll(":invalid");
  addClassesToEachelement(invalidElements, id, validDate);

  if (validDate === false) {
    const DATE_INPUT = document.getElementById("task-due-date--edit-task");
    DATE_INPUT.closest(".required").classList.add("after", "invalid");
  }
  focusInvalidElement(invalidElements[0], taskForm);
}

/**
 * Applies invalid-field styling to each invalid form element and marks the due date field when needed.
 *
 * @param {NodeListOf<HTMLElement>} invalidElements - The invalid form elements returned by the browser.
 * @param {string} id - The current form identifier suffix.
 * @param {boolean} validDate - Indicates whether the date input is valid.
 * @returns {void}
 */
function addClassesToEachelement(invalidElements, id, validDate) {
  invalidElements.forEach((element) => {
    if (element.id !== "task-due-date" + id) {
      element.classList.add("invalid");
      element.closest(".required").classList.add("after");
    } else {
      if (validDate !== false) {
        element.closest(".required").classList.add("after", "invalid");
      }
    }
  });
}

/**
 * Adds error styling classes to the category dropdown.
 * @param {HTMLFormElement} taskForm - The form containing the category dropdown
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function addCategoryClasses(taskForm, id) {
  const categoriesDropdown = document.getElementById(
    "categories-dropdown" + id,
  );
  const categoryTrigger = document.getElementById(
    "custom-select-trigger-category" + id,
  );
  categoriesDropdown.classList.add("after");
  categoryTrigger.classList.add("invalid");
}

/**
 * Focuses an element and scrolls it into view with smooth behavior.
 * @param {HTMLElement} element - The element to focus
 * @param {HTMLFormElement} taskForm - The form containing the field
 * @returns {void}
 */
function focusInvalidElement(element, taskForm) {
  element.focus();
  if (taskForm && taskForm.id === "task-form--add-task") {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

/**
 * Handles focusout event on the contacts dropdown, clearing the search and closing the dropdown.
 * @param {FocusEvent} e - The focusout event object
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function contactsDropdownFocusOutFunction(e, id) {
  const nextFocused = e.relatedTarget;
  const contactsDropdown = e.currentTarget;
  const contactInput = document.getElementById("search-contact-input" + id);
  if (!contactsDropdown.contains(nextFocused)) {
    contactInput.value = "";
    let inputValue = contactInput.value;
    filterContacts(inputValue);
    closeCustomSelectDropdown("contacts", id);
  }
}

/**
 * Handles focusout event on the categories dropdown, closing it when focus leaves.
 * @param {FocusEvent} e - The focusout event object
 * @param {string} id - The identifier suffix for the current form or dialog instance
 * @returns {void}
 */
function categoriesDropdownFocusOutFunction(e, id) {
  const nextFocused = e.relatedTarget;
  const categoriesDropdown = e.currentTarget;
  if (!categoriesDropdown.contains(nextFocused)) {
    closeCustomSelectDropdown("category", id);
  }
}
