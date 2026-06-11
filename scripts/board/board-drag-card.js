let touchTimeout;
let isLongPress = false;
let startX, startY;

/**
 * Handles the start of a drag operation for mouse and touch interactions.
 *
 * @param {Event} event - The drag start event.
 * @param {string} id - The ID of the task being dragged.
 * @returns {void}
 */
function startDragging(event, id) {
  currentDraggedElement = id;
  let card = event.target.closest(".card");

  if (event.type === "touchstart") {
    initMobileTouch(event, card);
  } else if (card) {
    card.classList.add("dragging");
  }
}

/**
 * Initializes the mobile touch handling for drag operations.
 * @param {Event} event - The touch start event.
 * @param {HTMLElement} card - The card element being dragged.
 * @returns {void}
 */
function initMobileTouch(event, card) {
  startX = event.touches[0].clientX;
  startY = event.touches[0].clientY;
  isLongPress = false;

  card.oncontextmenu = (e) => e.preventDefault();

  touchTimeout = setTimeout(() => {
    isLongPress = true;
    activateMobileDragStyle(card);
  }, 100);
}

/**
 * Activates the mobile drag style and disables global text selection.
 * @param {HTMLElement} card - The card element for which to activate drag style.
 * @returns {void}
 */
function activateMobileDragStyle(card) {
  if (card) {
    card.classList.add("dragging");
    card.style.pointerEvents = "none";
    document.body.classList.add("disable-select-global");
  }
}

/**
 * Allows dropping a dragged item and enables desktop auto-scroll during drag.
 *
 * @param {DragEvent} ev - The drag-over event.
 * @returns {void}
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Checks mouse position and scrolls if near top or bottom.
 *
 * @param {number} clientY - The current vertical position of the mouse cursor.
 * @returns {void}
 */
function handleDesktopScroll(clientY) {
  const threshold = 120;
  const speed = 50;

  if (clientY < threshold) {
    window.scrollBy(0, -speed);
  } else if (clientY > window.innerHeight - threshold) {
    window.scrollBy(0, speed);
  }
}

/**
 * Prevents the red "blocked" cursor globally while dragging.
 * @returns {void}
 */
function initGlobalDragSettings() {
  document.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    handleDesktopScroll(ev.clientY);
  });
}

/**
 * Moves the card with the finger and handles automatic page scrolling and column highlighting.
 *
 * @param {TouchEvent} event - The touch move event.
 * @returns {void}
 */
function handleTouchMove(event) {
  let touch = event.touches ? event.touches[0] : null;

  if (!isLongPress || !touch) {
    if (
      touch &&
      (Math.abs(touch.clientX - startX) > 10 ||
        Math.abs(touch.clientY - startY) > 10)
    ) {
      clearTimeout(touchTimeout);
    }
    return;
  }

  if (event.cancelable) {
    event.preventDefault();
  } else {
    return;
  }

  handleCard(event, touch);
}

/**
 * Positions the dragged card under the current touch point and updates drag feedback.
 *
 * @param {Event} event - The touch move event.
 * @param {Object} touch - The current touch coordinates object.
 * @param {number} touch.clientX - The vertical client X position.
 * @param {number} touch.clientY - The vertical client Y position.
 * @returns {void}
 */
function handleCard(event, touch) {
  let card = event.target.closest(".card");
  if (card) {
    card.style.position = "fixed";
    card.style.left = `${touch.clientX - card.offsetWidth / 2}px`;
    card.style.top = `${touch.clientY - card.offsetHeight / 2}px`;
    checkAutoScroll(touch.clientY);
    handleMobileHighlight(touch.clientX, touch.clientY);
  }
}

/**
 * Manually highlights the column container under the user's finger on mobile devices.
 *
 * @param {number} x - The current horizontal position of the finger.
 * @param {number} y - The current vertical position of the finger.
 * @returns {void}
 */
function handleMobileHighlight(x, y) {
  let element = document.elementFromPoint(x, y);
  let currentContainer = element ? element.closest(".card-container") : null;

  document
    .querySelectorAll(".card-container")
    .forEach((c) => c.classList.remove("drag-area-highlight"));

  if (currentContainer && currentContainer.id) {
    currentContainer.classList.add("drag-area-highlight");
  }
}

/**
 * Automatically scrolls the window when the finger is near the top or bottom edge.
 *
 * @param {number} clientY - The current vertical position of the finger.
 * @returns {void}
 */
function checkAutoScroll(clientY) {
  let speed = 200;
  let threshold = 100;

  if (clientY < threshold) {
    window.scrollBy(0, -speed);
  } else if (clientY > window.innerHeight - threshold) {
    window.scrollBy(0, speed);
  }
}

/**
 * Handles the end of a touch event, triggers drop logic, and restores text selection.
 * @param {Event} event - The touch end event.
 * @returns {void}
 */
function stopDragging(event) {
  clearTimeout(touchTimeout);
  document.body.classList.remove("disable-select-global");

  document
    .querySelectorAll(".card-container")
    .forEach((c) => c.classList.remove("drag-area-highlight"));

  event.target.classList.remove("dragging");
  let card = event.target.closest(".card");
  if (card) card.style.position = "";

  handleTouchEnd(event);
}

/**
 * Evaluates the final drop placement container when a mobile touch interaction terminates.
 * @param {Event} event - The touch end event.
 * @returns {void}
 */
function handleTouchEnd(event) {
  if (event.type === "touchend" && isLongPress) {
    let touch = event.changedTouches[0];
    let element = document.elementFromPoint(touch.clientX, touch.clientY);
    let columnContainer = element ? element.closest(".card-container") : null;
    if (columnContainer) moveTo(columnContainer.id);
    updateHTML();
  }
}

/**
 * Moves a task to a different column and updates Firebase.
 *
 * @async
 * @param {string} column - The target column.
 * @returns {Promise<void>} Resolves when state is modified and synced.
 */
async function moveTo(column) {
  let task = todos.find((t) => t.id === currentDraggedElement);
  if (task) {
    task["column"] = column;
    updateHTML();
    await updateTaskInFirebase(task);
  }
}

/**
 * Highlights a drag area.
 *
 * @param {string} id - The ID of the drag area to highlight.
 * @returns {void}
 */
function highlight(id) {
  document.getElementById(id).classList.add("drag-area-highlight");
}

/**
 * Removes the highlight from a drag area.
 *
 * @param {string} id - The ID of the drag area to remove the highlight from.
 * @returns {void}
 */
function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-area-highlight");
}