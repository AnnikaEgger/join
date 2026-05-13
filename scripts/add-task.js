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

function openCustomSelectDropdown() {
  let options = document.getElementById("select-options");
  let arrow = document.getElementById("arrow-dropdown");

  options.classList.toggle("display-none");
  arrow.classList.toggle("rotate");
}

let checkedStatus = false;

function selectOption(indexOption) {
  let checkbox = document.getElementById("checkbox" + indexOption);

  if (checkedStatus == false) {
    checkedStatus = true;
  } else {
    checkedStatus = false;
  }
  checkbox.checked = checkedStatus;
}
