const users = {
  admin: { name: "Administrator", role: "admin" },
  ada: { name: "Ada", role: "staff" },
  david: { name: "David", role: "staff" }
};

let currentUser = null;

let tasks = [
  {
    title: "Prepare monthly report",
    assignedTo: "Ada",
    deadline: "2026-09-30",
    priority: "High",
    status: "In progress"
  },
  {
    title: "Reply to client email",
    assignedTo: "David",
    deadline: "2026-09-25",
    priority: "High",
    status: "In progress"
  },
  {
    title: "Book meeting room",
    assignedTo: "David",
    deadline: "2026-09-30",
    priority: "Low",
    status: "Completed"
  },
  {
    title: "Test overdue task",
    assignedTo: "David",
    deadline: "2026-09-01",
    priority: "Medium",
    status: "Not started"
  },
  {
    title: "Transfer training results",
    assignedTo: "Mr Dalu",
    deadline: "2026-12-12",
    priority: "Medium",
    status: "Not started"
  }
];

const loginScreen = document.querySelector("#login-screen");
const workspace = document.querySelector("#workspace");
const accountSelect = document.querySelector("#account-select");
const roleText = document.querySelector("#role-text");
const welcomeText = document.querySelector("#welcome-text");
const adminPanel = document.querySelector("#admin-panel");
const manageTitle = document.querySelector("#manage-title");
const updateButton = document.querySelector("#update-button");
const deleteArea = document.querySelector("#delete-area");
const taskList = document.querySelector("#task-list");
const alertMessage = document.querySelector("#alert-message");

function isOverdue(task) {
  if (task.status === "Completed") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(`${task.deadline}T00:00:00`);

  return deadline < today;
}

function getVisibleTasks() {
  if (currentUser.role === "admin") {
    return tasks.map((task, index) => ({
      task,
      number: index + 1
    }));
  }

  return tasks
    .map((task, index) => ({
      task,
      number: index + 1
    }))
    .filter(item =>
      item.task.assignedTo.toLowerCase() === currentUser.name.toLowerCase()
    );
}

function getStatusClass(task) {
  if (isOverdue(task)) {
    return "status-overdue";
  }

  if (task.status === "Completed") {
    return "status-completed";
  }

  if (task.status === "In progress") {
    return "status-in-progress";
  }

  return "status-not-started";
}

function updateMetrics(visibleTasks) {
  document.querySelector("#total-tasks").textContent = visibleTasks.length;

  document.querySelector("#not-started").textContent =
    visibleTasks.filter(item => item.task.status === "Not started").length;

  document.querySelector("#in-progress").textContent =
    visibleTasks.filter(item => item.task.status === "In progress").length;

  document.querySelector("#completed").textContent =
    visibleTasks.filter(item => item.task.status === "Completed").length;

  document.querySelector("#overdue").textContent =
    visibleTasks.filter(item => isOverdue(item.task)).length;
}

function showTasks() {
  const searchText = document.querySelector("#search-box").value.toLowerCase();
  const selectedFilter = document.querySelector("#filter-select").value;

  const visibleTasks = getVisibleTasks();

  const filteredTasks = visibleTasks.filter(item => {
    const task = item.task;

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      task.assignedTo.toLowerCase().includes(searchText);

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "overdue" && isOverdue(task)) ||
      (selectedFilter === "not-started" && task.status === "Not started") ||
      (selectedFilter === "in-progress" && task.status === "In progress") ||
      (selectedFilter === "completed" && task.status === "Completed") ||
      (selectedFilter === "high" && task.priority === "High");

    return matchesSearch && matchesFilter;
  });

  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    taskList.innerHTML = "<p>No matching tasks found.</p>";
    return;
  }

  filteredTasks.forEach(item => {
    const task = item.task;

    const overdueText = isOverdue(task) ? " • OVERDUE" : "";

    taskList.innerHTML += `
      <article class="task-item">
        <h3>${item.number}. ${task.title}${overdueText}</h3>
        <p><strong>Responsible:</strong> ${task.assignedTo}</p>
        <p><strong>Deadline:</strong> ${task.deadline}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <span class="status ${getStatusClass(task)}">${task.status}</span>
      </article>
    `;
  });
}

function renderApp() {
  const visibleTasks = getVisibleTasks();

  roleText.textContent =
    `${currentUser.name} • ${currentUser.role.toUpperCase()} VIEW`;

  welcomeText.textContent =
    `Welcome, ${currentUser.name}.`;

  if (currentUser.role === "admin") {
    adminPanel.classList.remove("hidden");
    deleteArea.classList.remove("hidden");
    manageTitle.textContent = "Manage a Task";
    updateButton.textContent = "Update Status";
  } else {
    adminPanel.classList.add("hidden");
    deleteArea.classList.add("hidden");
    manageTitle.textContent = "Update My Task";
    updateButton.textContent = "Update My Status";
  }

  updateMetrics(visibleTasks);
  showTasks();
}

document.querySelector("#continue-button").addEventListener("click", () => {
  currentUser = users[accountSelect.value];

  loginScreen.classList.add("hidden");
  workspace.classList.remove("hidden");

  renderApp();
});

document.querySelector("#logout-button").addEventListener("click", () => {
  currentUser = null;

  workspace.classList.add("hidden");
  loginScreen.classList.remove("hidden");

  alertMessage.classList.add("hidden");
});

document.querySelector("#add-task-button").addEventListener("click", () => {
  const title = document.querySelector("#task-title").value.trim();
  const person = document.querySelector("#task-person").value.trim();
  const deadline = document.querySelector("#task-deadline").value;
  const priority = document.querySelector("#task-priority").value;

  if (title === "" || person === "" || deadline === "") {
    alert("Please fill in every task box.");
    return;
  }

  tasks.push({
    title,
    assignedTo: person,
    deadline,
    priority,
    status: "Not started"
  });

  document.querySelector("#task-title").value = "";
  document.querySelector("#task-person").value = "";
  document.querySelector("#task-deadline").value = "";
  document.querySelector("#task-priority").value = "Medium";

  renderApp();
});

document.querySelector("#update-button").addEventListener("click", () => {
  const taskNumber = Number(document.querySelector("#update-number").value);
  const newStatus = document.querySelector("#new-status").value;

  if (!taskNumber || !tasks[taskNumber - 1]) {
    alert("Use a task number shown in the list.");
    return;
  }

  const task = tasks[taskNumber - 1];

  if (
    currentUser.role === "staff" &&
    task.assignedTo.toLowerCase() !== currentUser.name.toLowerCase()
  ) {
    alert("You can only update tasks assigned to you.");
    return;
  }

  task.status = newStatus;
  document.querySelector("#update-number").value = "";

  renderApp();
});

document.querySelector("#delete-button").addEventListener("click", () => {
  const taskNumber = Number(document.querySelector("#delete-number").value);

  if (!taskNumber || !tasks[taskNumber - 1]) {
    alert("Use a task number shown in the list.");
    return;
  }

  const task = tasks[taskNumber - 1];

  const shouldDelete = confirm(
    `Delete this task?\n\n${task.title}`
  );

  if (shouldDelete) {
    tasks.splice(taskNumber - 1, 1);
    document.querySelector("#delete-number").value = "";
    renderApp();
  }
});

document.querySelector("#search-box").addEventListener("input", showTasks);

document.querySelector("#filter-select").addEventListener("change", showTasks);

document.querySelector("#alerts-button").addEventListener("click", () => {
  const alerts = [];

  getVisibleTasks().forEach(item => {
    const task = item.task;

    if (task.status === "Completed") {
      return;
    }

    if (isOverdue(task)) {
      alerts.push(`OVERDUE: ${task.title}`);
    } else if (task.status === "Not started") {
      alerts.push(`NOT STARTED: ${task.title}`);
    }
  });

  if (alerts.length === 0) {
    alertMessage.textContent = "No alerts right now.";
  } else {
    alertMessage.textContent = alerts.join(" • ");
  }

  alertMessage.classList.remove("hidden");
});