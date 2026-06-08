// /**
//  * Loads default task templates from Firebase.
//  * @returns {Promise<Object>} The default task template data.
//  */
// async function getDefaultTasksTemplates() {
//   let response = await fetch(BASE_URL + "default_tasks" + ".json");
//   let responseToJson = await response.json();

//   return responseToJson;
// }

// /**
//  * Loads all tasks from Firebase and returns entries for default tasks.
//  * @returns {Promise<Array<[string, Object]>>} An array of [taskId, task] pairs.
//  */
// async function getDefaultTasksFromBoard() {
//   let response = await fetch(BASE_URL + "tasks" + ".json");
//   let tasks = await response.json();

//   const defaultTasksBoard = Object.entries(tasks).filter(
//     ([taskId, task]) => task.default_task === true,
//   );

//   return defaultTasksBoard;
// }

// /**
//  * Finds which default task templates are missing from the board.
//  * @returns {Promise<void>}
//  */
// async function getMissingDefaultTasks() {
//   const defaultTasksBoard = await getDefaultTasksFromBoard();

//   const requiredIds = [
//     "template1",
//     "template2",
//     "template3",
//     "template4",
//     "template5",
//   ];

//   const existingIds = defaultTasksBoard.map(
//     ([taskId, task]) => task.template_id,
//   );

//   let missingDefaultTasksIds = requiredIds.filter(
//     (requiredId) => !existingIds.includes(requiredId),
//   );

//   if (missingDefaultTasksIds.length > 0) {
//     await postMissingDefaultTasks(missingDefaultTasksIds);
//   }
// }

// /**
//  * Posts missing default task templates as new tasks in Firebase.
//  * @param {Array<string>} missingDefaultTasksIds - Template IDs to create.
//  * @returns {Promise<void>}
//  */
// async function postMissingDefaultTasks(missingDefaultTasksIds) {
//   let defaultTasksTemplates = await getDefaultTasksTemplates();

//   for (const missingTemplateId of missingDefaultTasksIds) {
//     const template = defaultTasksTemplates.find(
//       (templateTask) => templateTask.template_id === missingTemplateId,
//     );

//     if (template) {
//       await postTask(template);
//     }
//   }
// }

// /**
//  * Creates a new task entry in Firebase.
//  * @param {Object} task - The task payload to post.
//  * @returns {Promise<void>}
//  */
// async function postTask(task) {
//   await fetch(BASE_URL + "tasks" + ".json", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(task),
//   });
// }

// /**
//  * Updates existing default tasks on the board to match current templates.
//  * @returns {Promise<void>}
//  */
// async function patchExistingDefaultTasks() {
//   const defaultTasksBoard = await getDefaultTasksFromBoard();
//   const defaultTasksTemplates = await getDefaultTasksTemplates();

//   for (const [taskId, task] of defaultTasksBoard) {
//     const template = defaultTasksTemplates.find(
//       (template) => template.template_id === task.template_id,
//     );

//     if (template) {
//       await patchDefaultTask(taskId, template);
//     }
//   }
// }

// /**
//  * Patches a default task with template data.
//  * @param {string} taskId - The ID of the board task to patch.
//  * @param {Object} template - The template used to update the task.
//  * @returns {Promise<void>}
//  */
// async function patchDefaultTask(taskId, template) {
//   await fetch(BASE_URL + `tasks/${taskId}.json`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       title: template.title,
//       description: template.description,
//       subtasks: template.subtasks,
//       category: template.category,
//     }),
//   });
// }

// /**
//  * Ensures default task templates are present and synchronized on the board.
//  * @returns {Promise<void>}
//  */
// /**
//  * Ensures default task templates are present and synchronized on the board.
//  * It removes duplicates, creates missing task entries, and updates existing tasks.
//  * @returns {Promise<void>}
//  */
// async function ensureAllDefaultTasksAreInBoard() {
//   await checkForDefaultTasksDuplicates();
//   await getMissingDefaultTasks();
//   await patchExistingDefaultTasks();
// }

// /**
//  * Detects duplicate default tasks on the board and schedules them for deletion.
//  * @returns {Promise<void>}
//  */
// async function checkForDefaultTasksDuplicates() {
//   const defaultTasksBoard = await getDefaultTasksFromBoard();

//   const seen = new Map();
//   const tasksToDelete = [];

//   for (const [key, task] of defaultTasksBoard) {
//     const templateId = task.template_id;

//     if (seen.has(templateId)) {
//       tasksToDelete.push(key);
//     } else {
//       seen.set(templateId, key);
//     }
//   }

//   await deleteDefaultTasksDuplicates(tasksToDelete);
// }

// /**
//  * Deletes duplicate default tasks from Firebase.
//  * @param {Array<string>} tasksToDelete - Board task IDs to delete.
//  * @returns {Promise<void>}
//  */
// async function deleteDefaultTasksDuplicates(tasksToDelete) {
//   for (const key of tasksToDelete) {
//     fetch(BASE_URL + `tasks/${key}.json`, {
//       method: "DELETE",
//     });
//   }
// }
