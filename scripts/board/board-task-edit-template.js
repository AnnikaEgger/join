/**
 * Returns the HTML template for the task edit dialog view.
 *
 * @param {Object} task - The task data to prefill in the edit form layouts.
 * @param {string} task.column - The column status path where the card resides.
 * @param {boolean} task.default_task - Flags if the element belongs to standard core data.
 * @param {string} task.template_id - The structural identifier key for layouts.
 * @param {string} task.title - Preloaded title text content.
 * @param {string} task.description - Preloaded narrative description content.
 * @param {string} task.due_date - Preloaded ISO or local standard date value.
 * @param {string} taskId - The unique Firebase task identifier key.
 * @returns {string} The rendered HTML form string for edit mode.
 */
function taskEditModeTemplate(task, taskId) {
  return ` 
      <div id="content-wrapper--task-dialog" class="content-wrapper-task-dialog content-wrapper-task-dialog--edit disabled-ui">
    <div class="edit-task-closing-btn-wrapper">
        <button
          class="edit-task-dialog-closing-btn"
          onclick="openTaskDialog('${taskId}')"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.243 6.243L11.486 11.486M1 11.486L6.243 6.243L1 11.486ZM11.486 1L6.242 6.243L11.486 1ZM6.242 6.243L1 1L6.242 6.243Z"
              stroke="#2A3647"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <form
        aria-labelledby="add-task-headline"
        onsubmit="submitEditedTask( event, '${task.column}', ${task.default_task}, '${taskId}', '${task.template_id}')"
        id="task-form--edit-task"
        class="task-form task-form--edit-task"
        novalidate
      >
        <div class="add-task-inner-wrapper add-task-inner-wrapper--edit-task">
          <div class="add-task-container add-task-container-left">
            <section class="title-section">
              <label class="label" for="task-title--edit-task">Title</label>
              <div class="required">
                <textarea
                class="edit-task-title-textarea"
                  id="task-title--edit-task"
                  placeholder="Enter a title"
                  pattern=".*\\S.*"
                  required
                  oninput="checkIfInputValid('title', '--edit-task')"
                  onblur="checkIfInputInvalid('title', '--edit-task')"
                >${task.title}</textarea>
              </div>
            </section>

            <section class="description-section">
              <label class="label" for="task-description--edit-task">Description</label>
              <textarea
              class="description-textarea"
                id="task-description--edit-task"
                placeholder="Enter a description"
              >${task.description}</textarea>
            </section>

            <section class="due-date-section">
              <label class="label" for="task-due-date--edit-task">Due Date</label>
              <div
                class="required custom-select-input custom-select-input--date trigger-input-container"
                tabindex="0"
              >
                <input
                oninput="checkIfInputValid('due-date', '--edit-task')"
                    onblur="checkIfInputInvalid('due-date', '--edit-task')"
                  class="task-date-input"
                  id="task-due-date--edit-task"
                  lang="en-GB"
                  type="date"
                  value="${task.due_date}"
                  required
                />
                <button
                  class="calendar-svg-btn"
                  type="button"
                  onblur="checkIfInputInvalid('due-date', '--edit-task')"
                  onclick="showDatePicker('--edit-task')"
                  aria-label="pick date"
                >
                  <svg
                    class="calendar-icon"
                    width="18"
                    height="20"
                    viewBox="0 0 18 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.5 16C10.8 16 10.2083 15.7583 9.725 15.275C9.24167 14.7917 9 14.2 9 13.5C9 12.8 9.24167 12.2083 9.725 11.725C10.2083 11.2417 10.8 11 11.5 11C12.2 11 12.7917 11.2417 13.275 11.725C13.7583 12.2083 14 12.8 14 13.5C14 14.2 13.7583 14.7917 13.275 15.275C12.7917 15.7583 12.2 16 11.5 16ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V1C3 0.716667 3.09583 0.479167 3.2875 0.2875C3.47917 0.0958333 3.71667 0 4 0C4.28333 0 4.52083 0.0958333 4.7125 0.2875C4.90417 0.479167 5 0.716667 5 1V2H13V1C13 0.716667 13.0958 0.479167 13.2875 0.2875C13.4792 0.0958333 13.7167 0 14 0C14.2833 0 14.5208 0.0958333 14.7125 0.2875C14.9042 0.479167 15 0.716667 15 1V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H2ZM2 18H16V8H2V18ZM2 6H16V4H2V6Z"
                      fill="#2A3647"
                    />
                  </svg>
                </button>
              </div>
            </section>
          </div>

          <div class="seperation-line"></div>

          <div class="add-task-container add-task-container-right">
            <section class="prio-section">
              <p class="label">Priority</p>
              <div id="task-priority" class="add-task-prio-btns-container add-task-prio-btns-container--edit-task">
                <button
                  type="button"
                  onclick="setPriority('Urgent', '--edit-task')"
                  id="urgent-prio-btn--edit-task"
                  class="prio-btn"
                  aria-label="set priority to urgent"
                >
                  Urgent
                  <svg
                    id="urgent-prio-svg--edit-task"
                    class="prio-svg"
                    width="20"
                    height="15"
                    viewBox="0 0 20 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.9043 14.5096C18.6696 14.51 18.4411 14.4351 18.2522 14.2961L10.0001 8.21288L1.74809 14.2961C1.63224 14.3816 1.50066 14.4435 1.36086 14.4783C1.22106 14.513 1.07577 14.5199 0.933305 14.4986C0.790837 14.4772 0.653973 14.428 0.530528 14.3538C0.407083 14.2796 0.299474 14.1818 0.213845 14.0661C0.128216 13.9503 0.0662437 13.8188 0.0314671 13.6791C-0.00330956 13.5394 -0.0102098 13.3943 0.0111604 13.2519C0.0543195 12.9644 0.21001 12.7058 0.443982 12.533L9.34809 5.96249C9.53679 5.8229 9.76536 5.74756 10.0001 5.74756C10.2349 5.74756 10.4635 5.8229 10.6522 5.96249L19.5563 12.533C19.7422 12.6699 19.8801 12.862 19.9503 13.0819C20.0204 13.3018 20.0193 13.5382 19.9469 13.7573C19.8746 13.9765 19.7349 14.1673 19.5476 14.3024C19.3604 14.4375 19.1352 14.51 18.9043 14.5096Z"
                      fill="#FF3D00"
                    />
                    <path
                      d="M18.9043 8.76057C18.6696 8.76097 18.4411 8.68612 18.2522 8.54702L10.0002 2.46386L1.7481 8.54702C1.51412 8.71983 1.22104 8.79269 0.93331 8.74956C0.645583 8.70643 0.386785 8.55086 0.213849 8.31706C0.0409137 8.08326 -0.0319941 7.79039 0.011165 7.50288C0.054324 7.21536 0.210015 6.95676 0.443986 6.78395L9.3481 0.213471C9.5368 0.0738799 9.76537 -0.00146484 10.0002 -0.00146484C10.2349 -0.00146484 10.4635 0.0738799 10.6522 0.213471L19.5563 6.78395C19.7422 6.92087 19.8801 7.11298 19.9503 7.33286C20.0204 7.55274 20.0193 7.78914 19.947 8.00832C19.8746 8.22751 19.7349 8.41826 19.5476 8.55335C19.3604 8.68844 19.1352 8.76096 18.9043 8.76057Z"
                      fill="#FF3D00"
                    />
                  </svg></button
                ><button
                  type="button"
                  onclick="setPriority('Medium', '--edit-task')"
                  id="medium-prio-btn--edit-task"
                  class="prio-btn"
                  aria-label="set priority to medium"
                >
                  Medium<svg
                    id="medium-prio-svg--edit-task"
                    class="prio-svg"
                    width="20"
                    height="8"
                    viewBox="0 0 20 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.9041 7.45086H1.09589C0.805242 7.45086 0.526498 7.33456 0.320979 7.12755C0.11546 6.92054 0 6.63977 0 6.34701C0 6.05425 0.11546 5.77349 0.320979 5.56647C0.526498 5.35946 0.805242 5.24316 1.09589 5.24316H18.9041C19.1948 5.24316 19.4735 5.35946 19.679 5.56647C19.8845 5.77349 20 6.05425 20 6.34701C20 6.63977 19.8845 6.92054 19.679 7.12755C19.4735 7.33456 19.1948 7.45086 18.9041 7.45086Z"
                      fill="#ffa800"
                    />
                    <path
                      d="M18.9041 2.2077H1.09589C0.805242 2.2077 0.526498 2.0914 0.320979 1.88439C0.11546 1.67738 0 1.39661 0 1.10385C0 0.81109 0.11546 0.530322 0.320979 0.32331C0.526498 0.116298 0.805242 0 1.09589 0L18.9041 0C19.1948 0 19.4735 0.116298 19.679 0.32331C19.8845 0.530322 20 0.81109 20 1.10385C20 1.39661 19.8845 1.67738 19.679 1.88439C19.4735 2.0914 19.1948 2.2077 18.9041 2.2077Z"
                      fill="#ffa800"
                    />
                  </svg></button
                ><button
                  type="button"
                  onclick="setPriority('Low', '--edit-task')"
                  id="low-prio-btn--edit-task"
                  class="prio-btn"
                  aria-label="set priority to low"
                >
                  Low<svg
                    id="low-prio-svg--edit-task"
                    class="prio-svg"
                    width="20"
                    height="15"
                    viewBox="0 0 20 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 8.76077C9.7654 8.76118 9.53687 8.68634 9.34802 8.54726L0.444913 1.97752C0.329075 1.89197 0.231235 1.78445 0.15698 1.66111C0.0827245 1.53777 0.033508 1.40102 0.0121402 1.25868C-0.031014 0.971193 0.0418855 0.678356 0.214802 0.444584C0.387718 0.210811 0.646486 0.0552534 0.934181 0.0121312C1.22188 -0.0309911 1.51493 0.0418545 1.74888 0.214643L10 6.29712L18.2511 0.214643C18.367 0.129087 18.4985 0.0671675 18.6383 0.0324205C18.7781 -0.00232646 18.9234 -0.00922079 19.0658 0.0121312C19.2083 0.0334832 19.3451 0.0826633 19.4685 0.156864C19.592 0.231064 19.6996 0.328831 19.7852 0.444584C19.8708 0.560336 19.9328 0.691806 19.9676 0.831488C20.023 0.97117 20.0092 1.11633 19.9879 1.25868C19.9665 1.40102 19.9173 1.53777 19.843 1.66111C19.7688 1.78445 19.6709 1.89197 19.5551 1.97752L10.652 8.54726C10.4631 8.68634 10.2346 8.76118 10 8.76077Z"
                      fill="#7AE229"
                    />
                    <path
                      d="M10 14.5093C9.7654 14.5097 9.53687 14.4349 9.34802 14.2958L0.444913 7.72606C0.210967 7.55327 0.0552944 7.29469 0.0121402 7.00721C-0.031014 6.71973 0.0418855 6.42689 0.214802 6.19312C0.387718 5.95935 0.646486 5.80379 0.934181 5.76067C1.22188 5.71754 1.51493 5.79039 1.74888 5.96318L10 12.0457L18.2511 5.96318C18.4851 5.79039 18.7781 5.71754 19.0658 5.76067C19.3535 5.80379 19.6123 5.95935 19.7852 6.19312C19.9581 6.42689 20.031 6.71973 19.9879 7.00721C19.9447 7.29469 19.789 7.55327 19.5551 7.72606L10.652 14.2958C10.4631 14.4349 10.2346 14.5097 10 14.5093Z"
                      fill="#7AE229"
                    />
                  </svg>
                </button>
              </div>
            </section>

            <section class="contacts-section">
              <p class="label" id="contacts-label--edit-task">Assigned to</p>
              <div class="select-wrapper">
                <div
                  aria-labelledby="contacts-label--edit-task"
                  class="custom-select custom-select--contacts"
                  id="contacts-dropdown--edit-task"
                >
                  <div
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-owns="select-options--contacts--edit-task"
                    onclick="toggleCustomSelectDropdown('contacts', '--edit-task')"
                    class="custom-select--trigger custom-select-input trigger-input-container"
                    id="custom-select-trigger-contacts--edit-task"
                    tabindex="0"
                  >
                    <input
                      oninput="handleContactsSearch('--edit-task')"
                      onclick="handleStopPropagation(event, '--edit-task')"
                      class="search-contact-input"
                      id="search-contact-input--edit-task"
                      type="search"
                      placeholder="Select contacts to assign"
                      aria-label="select contacts to assign"
                      aria-autocomplete="list"
                      aria-controls="select-options--contacts--edit-task"
                    />
                    <button
                      type="button"
                      aria-label="Open contact selection"
                      class="custom-select--trigger--img-container"
                    >
                      <img
                        id="arrow-dropdown--contacts--edit-task"
                        src="../assets/icons/arrow-drop-down.svg"
                        alt="arrow down icon"
                      />
                    </button>
                  </div>

                  <ul
                    role="listbox"
                    id="select-options--contacts--edit-task"
                    class="custom-select-options custom-select-options--contacts display-none"
                  ></ul>
                </div>

                <div
                  class="selected-contacts"
                  id="selected-contacts-container--edit-task"
                ></div>
              </div>
            </section>

            <section class="subtask-section">
              <p class="label">Subtasks</p>
              <div class="subtask-container">
                <div
                  tabindex="0"
                  class="trigger-input-container custom-select-input"
                >
                  <input
                    class="subtask-input"
                    type="text"
                    id="subtask-input--edit-task"
                    placeholder="Add new subtask"
                    aria-label="add subtask"
                      pattern=".*\\S.*"
                  />
                  <div class="subtask-btns-container">
                    <button
                      class="subtask-btn-left"
                      type="button"
                      onclick="clearSubtaskInput('--edit-task')"
                      aria-label="delete current input"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.243 6.243L11.486 11.486M1 11.486L6.243 6.243L1 11.486ZM11.486 1L6.242 6.243L11.486 1ZM6.242 6.243L1 1L6.242 6.243Z"
                          stroke="#2A3647"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                    <div class="subtask-btns-seperation-line"></div>

                    <button
                      class="subtask-btn-right"
                      type="button"
                      onclick="addSubtask('--edit-task')"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 8.5L5 12.5L13 1"
                          stroke="#2A3647"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <ul
                  class="subtask-list"
                  id="subtask-list--edit-task"
                  aria-label="subtask list"
                ></ul>
              </div>
            </section>
          </div>
        </div>

          <div class="edit-task-ok-btn-wrapper">
            <button
              id="task-edit-ok-btn"
              type="submit"
              class="button bottom-btn bottom-btn--edit-task button-blue create-task-btn"
              aria-label="create task"
            >
              Ok
              <svg
                id="create-task-btn-svg"
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.288 8.775L13.763 0.3C13.963 0.1 14.2005 0 14.4755 0C14.7505 0 14.988 0.1 15.188 0.3C15.388 0.5 15.488 0.7375 15.488 1.0125C15.488 1.2875 15.388 1.525 15.188 1.725L5.988 10.925C5.788 11.125 5.55467 11.225 5.288 11.225C5.02133 11.225 4.788 11.125 4.588 10.925L0.288 6.625C0.088 6.425 -0.00783333 6.1875 0.0005 5.9125C0.00883333 5.6375 0.113 5.4 0.313 5.2C0.513 5 0.7505 4.9 1.0255 4.9C1.3005 4.9 1.538 5 1.738 5.2L5.288 8.775Z"
                  fill="white"
                />
              </svg>
            </button>
        </div>
      </form>`;
}