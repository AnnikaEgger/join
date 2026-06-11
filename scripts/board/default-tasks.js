/**
 * @typedef {Object} AssignedContact
 * @property {string} color - Hex background color configuration for rendering badges.
 * @property {string} id - Explicit contact entry data key reference mapping identifier.
 * @property {string} name - Clear human identity representation string parameters.
 */

/**
 * @typedef {Object} SubtaskItem
 * @property {boolean} done - Current binary completeness check indicator evaluation tracker.
 * @property {string} title - Explicit short display action description string.
 */

/**
 * @typedef {Object} TaskTemplate
 * @property {Array<AssignedContact>} assigned_contacts - Mapped collection reference indices listing members.
 * @property {string} category - Structural categorization tag context label designation.
 * @property {string} column - Active targeted lane assignment indicator identifier.
 * @property {boolean} default_task - Configuration baseline tag context standard classification flags.
 * @property {string} description - Long paragraph body mapping detailed requirement notes.
 * @property {string} due_date - Formatted date string notation limits configuration parameters.
 * @property {string} priority - Urgency triage scale assessment value tags.
 * @property {Array<SubtaskItem>} subtasks - Active inner checklist goals elements compilation arrays.
 * @property {string} template_id - Base static model origin tracking layout key code index.
 * @property {string} title - Main header summary identification string label.
 */

/**
 * Default task templates used to populate Firebase with initial board tasks.
 * @constant {Array<TaskTemplate>}
 */
const defaultTasksArray = [
  {
    "assigned_contacts": [
      {
        "color": "#FF4646",
        "id": "c8",
        "name": "Tatjana Wolf",
      },
      {
        "color": "#1FD7C1",
        "id": "c6",
        "name": "Emmanuel Mauer",
      },
      {
        "color": "#9327FF",
        "id": "c4",
        "name": "David Eisenberg",
      },
    ],
    "category": "Technical Task",
    "column": "to do",
    "default_task": true,
    "description":
      "Build a secure authentication system using JWT, including token generation, validation, and protected routes for backend services.",
    "due_date": "2026-06-12",
    "priority": "Urgent",
    "subtasks": [
      {
        "done": false,
        "title": "Define authentication flow and token strategy",
      },
      {
        "done": false,
        "title": "Implement JWT generation on login",
      },
      {
        "done": false,
        "title": "Add middleware for route protection",
      },
      {
        "done": false,
        "title": "Write API tests for auth endpoints",
      },
    ],
    "template_id": "template1",
    "title": "Implement JWT-based authentication for API",
  },
  {
    "assigned_contacts": [
      {
        "color": "#FCBE2D",
        "id": "c5",
        "name": "Eva Fischer",
      },
      {
        "color": "#6E52FF",
        "id": "c3",
        "name": "Benedikt Ziegler",
      },
      {
        "color": "#1FD7C1",
        "id": "c10",
        "name": "Yvonne Müller",
      },
      {
        "color": "#FF4646",
        "id": "c8",
        "name": "Tatjana Wolf",
      },
    ],
    "category": "User Story",
    "column": "in progress",
    "default_task": true,
    "description":
      "Improve layout, usability, and responsiveness of the analytics dashboard with a focus on clearer data visualization and better UX structure.",
    "due_date": "2026-06-18",
    "priority": "Medium",
    "subtasks": [
      {
        "done": true,
        "title": "Analyze current dashboard pain points",
      },
      {
        "done": false,
        "title": "Create updated UI wireframes",
      },
      {
        "done": false,
        "title": "Redesign layout for responsiveness",
      },
      {
        "done": false,
        "title": "Validate improvements with stakeholder feedback",
      },
    ],
    "template_id": "template2",
    "title": "Redesign analytics dashboard for improved usability",
  },
  {
    "assigned_contacts": [
      {
        "color": "#FCBE2D",
        "id": "c22",
        "name": "Anton Meyer",
      },
      {
        "color": "#462F8A",
        "id": "c7",
        "name": "Marcel Bauer",
      },
    ],
    "category": "Technical Task",
    "column": "await feedback",
    "default_task": true,
    "description":
      "Investigate and resolve unstable transaction behavior in the checkout process affecting payment success rate.",
    "due_date": "2026-06-08",
    "priority": "Urgent",
    "subtasks": [
      {
        "done": true,
        "title": "Reproduce issue in staging environment",
      },
      {
        "done": true,
        "title": "Analyze payment service logs",
      },
      {
        "done": true,
        "title": "Implement and deploy hotfix",
      },
    ],
    "template_id": "template3",
    "title": "Fix intermittent payment gateway transaction failures",
  },
  {
    "assigned_contacts": [
      {
        "color": "#462F8A",
        "id": "c9",
        "name": "Norbert Kiess",
      },
    ],
    "category": "Technical Task",
    "column": "done",
    "default_task": true,
    "description":
      "Expand automated test coverage for user service including validation rules, edge cases, and error handling scenarios.",
    "due_date": "2026-06-05",
    "priority": "Low",
    "subtasks": [
      {
        "done": true,
        "title": "Set up and configure test framework",
      },
      {
        "done": true,
        "title": "Write core unit tests for user creation",
      },
      {
        "done": true,
        "title": "Add edge case coverage",
      },
    ],
    "template_id": "template4",
    "title": "Increase unit test coverage for user service",
  },
  {
    "assigned_contacts": [
      {
        "color": "#1FD7C1",
        "id": "c6",
        "name": "Emmanuel Mauer",
      },
      {
        "color": "#9327FF",
        "id": "c4",
        "name": "David Eisenberg",
      },
      {
        "color": "#1FD7C1",
        "id": "c10",
        "name": "Yvonne Müller",
      },
    ],
    "category": "Technical Task",
    "column": "to do",
    "default_task": true,
    "description":
      "Improve build speed and deployment efficiency by optimizing pipeline steps and introducing caching mechanisms.",
    "due_date": "2026-06-20",
    "priority": "Medium",
    "subtasks": [
      {
        "done": false,
        "title": "Identify pipeline bottlenecks",
      },
      {
        "done": false,
        "title": "Optimize build steps",
      },
      {
        "done": false,
        "title": "Introduce dependency caching",
      },
      {
        "done": false,
        "title": "Measure performance improvements",
      },
    ],
    "template_id": "template5",
    "title": "Optimize CI/CD pipeline performance and reliability",
  },
];

/**
 * Uploads the default task templates to Firebase under the "tasks" endpoint layer.
 * * @async
 * @returns {Promise<void>} Resolves when all standard fallback assets match parameters network sync calls complete.
 */
async function postDefaultTasksInFirebase() {
  for (const defaultTask of defaultTasksArray) {
    await fetch(BASE_URL + "tasks" + ".json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultTask),
    });
  }
}