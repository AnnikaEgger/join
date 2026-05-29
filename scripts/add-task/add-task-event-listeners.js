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
function registerEnterHandlers() {
  registerEnterHandler("#custom-select-trigger-contacts", () => {
    toggleCustomSelectDropdown("contacts");
  });

  contactOptionsEnterHandlers();
  contactOptionsCheckboxesEnterHandlers();

  registerEnterHandler("#custom-select-trigger-category", () => {
    toggleCustomSelectDropdown("category");
  });
  categoryOptionsEnterHandlers();

  registerEnterHandler("#subtask-input", addSubtask);
}

/**
 * Registers Enter key handlers for all contact options in the dropdown.
 */
function contactOptionsEnterHandlers() {
  let contactOptions = document.querySelectorAll(".contact-option");

  contactOptions.forEach((option) => {
    registerEnterHandler(
      "#contact-option-" + option.dataset.indexContact,
      () => {
        selectContact(
          option.dataset.indexContact,
          filteredContacts[option.dataset.indexContact].id,
          false,
        );
      },
    );
  });
}

/**
 * Registers Enter key handlers for all contact option checkboxes in the dropdown.
 */
function contactOptionsCheckboxesEnterHandlers() {
  let contactOptionsCheckboxes = document.querySelectorAll(
    ".contact-option-checkbox",
  );
  contactOptionsCheckboxes.forEach((checkbox) => {
    registerEnterHandler("#checkbox" + checkbox.dataset.indexContact, () => {
      selectContact(
        checkbox.dataset.indexContact,
        filteredContacts[checkbox.dataset.indexContact].id,
        false,
      );
    });
  });
}

/**
 * Registers Enter key handlers for all category options in the dropdown.
 */
function categoryOptionsEnterHandlers() {
  let categoryOptions = document.querySelectorAll(".category-option");
  categoryOptions.forEach((option) => {
    registerEnterHandler(
      "#category-option-" + option.dataset.indexCategory,
      () => {
        selectCategory(categoriesArr[option.dataset.indexCategory].title);
      },
    );
  });
}

// #endregion

// #region event listeners
const TASK_FORM = document.getElementById("task-form");
const CATEGORIES_DROPDOWN = document.getElementById("categories-dropdown");
const CATEGORY_TRIGGER = document.getElementById(
  "custom-select-trigger-category",
);
const CONTACTS_DROPDOWN = document.getElementById("contacts-dropdown");

/**
 * Attaches event listeners to form and dropdown elements.
 */
function addEventListeners() {
  TASK_FORM.addEventListener("keydown", taskFormKeydownFunction);
  TASK_FORM.addEventListener("submit", taskFormSubmitFunction);

  CONTACTS_DROPDOWN.addEventListener(
    "focusout",
    contactsDropdownFocusOutFunction,
  );

  CATEGORIES_DROPDOWN.addEventListener(
    "click",
    categoriesDropdownClickFunction,
  );
  CATEGORIES_DROPDOWN.addEventListener(
    "focusout",
    categoriesDropdownFocusOutFunction,
  );
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
function taskFormSubmitFunction(event) {
  const formIsValid = TASK_FORM.checkValidity();
  const categoryIsValid = selectedCategory !== "Select task category";

  if (!formIsValid || !categoryIsValid) {
    event.preventDefault();
    successfullSubmit = false;
    if (!formIsValid) {
      handleInvalidSubmit();
    }

    if (!categoryIsValid) {
      addCategoryClasses();
    }

    if (formIsValid && !categoryIsValid) {
      focusInvalidElement(CATEGORY_TRIGGER);
    }
  } else if (formIsValid && categoryIsValid) {
    successfullSubmit = true;
  }
}

/**
 * Marks invalid form fields with error styling and focuses the first invalid element.
 */
function handleInvalidSubmit() {
  const invalidElements = TASK_FORM.querySelectorAll(":invalid");

  invalidElements.forEach((element) => {
    if (element.id !== "task-due-date") {
      element.classList.add("invalid");
      element.closest(".required").classList.add("input-with-after");
    } else {
      element
        .closest(".required")
        .classList.add("custom-select-with-after", "invalid");
    }
  });

  focusInvalidElement(invalidElements[0]);
}

/**
 * Adds error styling classes to the category dropdown.
 */
function addCategoryClasses() {
  CATEGORIES_DROPDOWN.classList.add("custom-select-with-after");
  CATEGORY_TRIGGER.classList.add("invalid");
}

/**
 * Focuses an element and scrolls it into view with smooth behavior.
 * @param {HTMLElement} element - The element to focus
 */
function focusInvalidElement(element) {
  element.focus();
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

/**
 * Handles focusout event on the contacts dropdown, clearing the search and closing the dropdown.
 */
function contactsDropdownFocusOutFunction() {
  const nextFocused = event.relatedTarget;
  const CONTACT_INPUT = document.getElementById("search-contact-input");

  if (!CONTACTS_DROPDOWN.contains(nextFocused)) {
    CONTACT_INPUT.value = "";
    let inputValue = CONTACT_INPUT.value;
    filterContacts(inputValue);
    closeCustomSelectDropdown("contacts");
  }
}

/**
 * Handles click event on the categories dropdown, managing error state visibility.
 */
function categoriesDropdownClickFunction() {
  if (successfullSubmit == false) {
    CATEGORIES_DROPDOWN.classList.add("custom-select-with-after");
    CATEGORY_TRIGGER.classList.add("invalid");
  } else {
    CATEGORIES_DROPDOWN.classList.remove("custom-select-with-after");
    CATEGORY_TRIGGER.classList.remove("invalid");
  }
}

/**
 * Handles focusout event on the categories dropdown, closing it when focus leaves.
 */
function categoriesDropdownFocusOutFunction() {
  const nextFocused = event.relatedTarget;

  if (!CATEGORIES_DROPDOWN.contains(nextFocused)) {
    closeCustomSelectDropdown("category");
  }
}

// #endregion
