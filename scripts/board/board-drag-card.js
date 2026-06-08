let touchTimeout;
let isLongPress = false;
let startX, startY;

/**
 * Handles the start of a drag operation, including both mouse and touch events. For touch events, it initiates a long press detection to differentiate between scrolling and dragging on mobile devices.
 *
 * @param {parameter} event - The drag start event, which can be either a mouse or touch event.
 * @param {string} id - The ID of the task being dragged, used to identify which task is being moved during the drag and drop operation.
 */
function startDragging(event, id) {
  currentDraggedElement = id;
  let card = event.target.closest(".card");

  if (event.type === "touchstart") {
    initMobileTouch(event, card);
  } else if (card) {
    card.classList.add("dragging");
  } //
}

/**
 * Initializes the mobile touch handling for drag operations.
 *
 * @param {parameter} event - The touch start event.
 * @param {parameter} card - The card element being dragged.
 */
function initMobileTouch(event, card) {
  startX = event.touches[0].clientX;
  startY = event.touches[0].clientY;
  isLongPress = false; //

  touchTimeout = setTimeout(() => {
    isLongPress = true; //
    activateMobileDragStyle(card);
  }, 100);
}

/**
 * Activates the mobile drag style for the specified card.
 *
 * @param {parameter} card - The card element for which to activate drag style.
 */
function activateMobileDragStyle(card) {
  if (card) {
    //
    card.classList.add("dragging");
    card.style.pointerEvents = "none";
  }
}

/**
 * Allows drop and triggers auto-scroll on desktop during dragging.
 *
 * @param {parameter} ev - The drag over event, which is used to allow dropping of the dragged element and to trigger automatic scrolling of the page when dragging near the edges of the viewport on desktop devices.
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Checks mouse position and scrolls if near top or bottom.
 *
 * @param {number} clientY - The current vertical position of the mouse cursor, used to determine if the window should automatically scroll when dragging a task near the edges of the viewport on desktop devices.
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
 *
 * This function adds an event listener for the "dragover" event on the entire document, which prevents the default behavior that would show a "blocked" cursor when dragging elements over non-droppable areas. It also calls the `handleDesktopScroll` function to enable automatic scrolling when dragging near the edges of the viewport on desktop devices.
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
 * @param {parameter} event - The touch move event.
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
 * Handles the end of a touch event and triggers the drop logic.
 *
 * @param {parameter} event - The touch end event.
 */
function stopDragging(event) {
  clearTimeout(touchTimeout);
  document
    .querySelectorAll(".card-container")
    .forEach((c) => c.classList.remove("drag-area-highlight"));

  event.target.classList.remove("dragging");
  let card = event.target.closest(".card");
  if (card) card.style.position = "";

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
 * @param {string} column - The target column.
 */
function moveTo(column) {
  let task = todos.find((t) => t.id === currentDraggedElement);
  if (task) {
    task["column"] = column;
    updateHTML();
    updateTaskInFirebase(task);
  }
}

/**
 * Highlights a drag area.
 *
 * @param {parameter} id - The ID of the drag area to highlight.
 */
function highlight(id) {
  document.getElementById(id).classList.add("drag-area-highlight");
}

/**
 * Removes the highlight from a drag area.
 *
 * @param {parameter} id - The ID of the drag area to remove the highlight from.
 */
function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-area-highlight");
}
