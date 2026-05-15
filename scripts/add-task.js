let priority = "medium";

function setPriority(prio) {
  priority = prio;
  stylePrioBtnsColor();
  stylePrioSvgColors();
}

function stylePrioBtnsColor() {
  let activeBtn = document.getElementById(priority + "-prio-btn");

  document.querySelectorAll(".prio-btn").forEach((btn) => {
    if (btn !== activeBtn) {
      btn.classList.remove("urgent-active", "medium-active", "low-active");
    }
  });
  activeBtn.classList.toggle(priority + "-active");
}

function stylePrioSvgColors() {
  let activeSvg = document.getElementById(priority + "-prio-svg");

  document.querySelectorAll(".prio-svg").forEach((svg) => {
    if (svg !== activeSvg) {
      svg.querySelectorAll("path").forEach((path) => {
        path.classList.remove("active-svg");
      });
    }
  });

  activeSvg.querySelectorAll("path").forEach((path) => {
    path.classList.toggle("active-svg");
  });
}

let taskForm = document.getElementById("task-form");

taskForm.addEventListener("submit", (e) => {
  if (!taskForm.checkValidity()) {
    e.preventDefault();
    taskForm.querySelector(":invalid").focus();
  }
});

function openCustomSelectDropdown(selectName) {
  let options = document.getElementById("select-options" + "--" + selectName);
  let arrow = document.getElementById("arrow-dropdown" + "--" + selectName);
  options.classList.toggle("display-none");
  arrow.classList.toggle("rotate");
}

function selectContact(indexOption) {
  let checkbox = document.getElementById("checkbox" + indexOption);

  if (checkbox.checked == true) {
    checkbox.checked = false;
  } else {
    checkbox.checked = true;
  }
}

function selectCategory(category) {
  let selectedCategory = document.getElementById("selected-category");

  selectedCategory.innerText = category;

  openCustomSelectDropdown("category");
}

function addSubtask() {
  let subtaskInput = document.getElementById("subtask-input");
}
