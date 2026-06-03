const enterHandlers = new Map();
let successfullSubmit;

// #region enter handlers
/**
 * Registers a keyboard handler for a specific element selector.
 * @param {string} selector - The CSS selector to match
 * @param {Function} handler - The callback function to execute on Enter key
 */
function registerEnterHandler(selector, handler) {
  enterHandlers.set(selector, handler);
}

/**
 * Registers all Enter key handlers for form elements and dropdowns.
 */
function registerEnterHandlers(id) {
  registerEnterHandler("#custom-select-trigger-contacts" + id, () => {
    toggleCustomSelectDropdown("contacts", id);
  });

  contactOptionsEnterHandlers(id);
  contactOptionsCheckboxesEnterHandlers(id);

  registerEnterHandler("#custom-select-trigger-category" + id, () => {
    toggleCustomSelectDropdown("category", id);
  });
  categoryOptionsEnterHandlers(id);

  registerEnterHandler("#subtask-input" + id, () => addSubtask(id));
}

/**
 * Registers Enter key handlers for all contact options in the dropdown.
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
 */
function contactOptionsCheckboxesEnterHandlers(id) {
  let contactOptionsCheckboxes = document.querySelectorAll(
    ".contact-option-checkbox",
  );
  contactOptionsCheckboxes.forEach((checkbox) => {
    registerEnterHandler(
      "#checkbox" + checkbox.dataset.indexContact + id,
      () => {
        selectContact(
          checkbox.dataset.indexContact,
          filteredContacts[checkbox.dataset.indexContact].id,
          false,
          id,
        );
      },
    );
  });
}

/**
 * Registers Enter key handlers for all category options in the dropdown.
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

// #endregion

// #region event listeners

/**
 * Attaches event listeners to form and dropdown elements.
 */
function addEventListeners(id) {
  const taskForm = document.getElementById("task-form" + id);
  const contactsDropdown = document.getElementById("contacts-dropdown" + id);
  const categoriesDropdown = document.getElementById(
    "categories-dropdown" + id,
  );

  addTaskFormEventListeners(id);

  contactsDropdown.addEventListener("focusout", () =>
    contactsDropdownFocusOutFunction(event, id),
  );

  categoriesDropdown.addEventListener("click", () =>
    categoriesDropdownClickFunction(event, id),
  );
  categoriesDropdown.addEventListener("focusout", () =>
    categoriesDropdownFocusOutFunction(event, id),
  );
}

function addTaskFormEventListeners(id) {
  const taskForm = document.getElementById("task-form" + id);

  taskForm.addEventListener("keydown", taskFormKeydownFunction);
  taskForm.addEventListener("submit", () => taskFormSubmitFunction(event, id));
}

/**
 * Handles keydown events in the task form, triggering registered handlers on Enter key.
 * @param {KeyboardEvent} event - The keyboard event
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
 * Validates form submission, checking form validity and category selection.
 * Displays error messages and focuses invalid elements if needed.
 * @param {Event} event - The submit event
 */
function taskFormSubmitFunction(event, id) {
  const taskForm = event.target;
  const formIsValid = taskForm.checkValidity();
  const categoryIsValid = selectedCategory !== "Select task category";

  if (!formIsValid || !categoryIsValid) {
    event.preventDefault();
    successfullSubmit = false;
    if (!formIsValid) {
      handleInvalidSubmit(taskForm, id);
    }

    if (!categoryIsValid) {
      addCategoryClasses(taskForm, id);
    }

    if (formIsValid && !categoryIsValid) {
      const categoryTrigger = taskForm.querySelector(
        "#custom-select-trigger-category" + id,
      );
      focusInvalidElement(categoryTrigger);
    }
  } else if (formIsValid && categoryIsValid) {
    successfullSubmit = true;
  }
}

/**
 * Marks invalid form fields with error styling and focuses the first invalid element.
 */
function handleInvalidSubmit(taskForm, id) {
  const invalidElements = taskForm.querySelectorAll(":invalid");

  invalidElements.forEach((element) => {
    if (element.id !== "task-due-date" + id) {
      element.classList.add("invalid");
      element.closest(".required").classList.add("after");
    } else {
      element.closest(".required").classList.add("after", "invalid");
    }
  });

  focusInvalidElement(invalidElements[0], taskForm);
}

/**
 * Adds error styling classes to the category dropdown.
 */
function addCategoryClasses(taskForm, id) {
  // const id = taskForm.id.slice(-1);
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
 * Handles click event on the categories dropdown, managing error state visibility.
 */
function categoriesDropdownClickFunction(e, id) {
  const categoriesDropdown = e.currentTarget;
  // const idDropdown = categoriesDropdown.id.slice(-1);
  const categoryTrigger = document.getElementById(
    "custom-select-trigger-category" + id,
  );

  if (successfullSubmit == false) {
    categoriesDropdown.classList.add("after");
    categoryTrigger.classList.add("invalid");
  } else {
    categoriesDropdown.classList.remove("after");
    categoryTrigger.classList.remove("invalid");
  }
}

/**
 * Handles focusout event on the categories dropdown, closing it when focus leaves.
 */
function categoriesDropdownFocusOutFunction(e, id) {
  const nextFocused = e.relatedTarget;
  const categoriesDropdown = e.currentTarget;

  if (!categoriesDropdown.contains(nextFocused)) {
    closeCustomSelectDropdown("category", id);
  }
}

// #endregion
