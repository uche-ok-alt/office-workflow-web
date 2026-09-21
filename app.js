const users = {
  admin: { name: "Administrator", role: "admin" },
  ada: { name: "Ada", role: "staff" },
  david: { name: "David", role: "staff" },
  dalu: { name: "Dalu", role: "staff" }
};
const officeUnits = [
  "Operations",
  "Accounts",
  "Human Resources",
  "Client Services"
];

let currentUser = null;
let selectedTaskIndex = null;

let tasks = [
  {
    title: "Prepare monthly report",
    assignedTo: "Ada",
    deadline: "2026-09-30",
    unit: "Accounts",
    status: "In progress"
  },
  {
    title: "Reply to client email",
    assignedTo: "David",
    deadline: "2026-09-25",
    unit: "Client Services",
    status: "In progress"
  },
  {
    title: "Book meeting room",
    assignedTo: "David",
    deadline: "2026-09-30",
    unit: "Operations",
    status: "Completed"
  },
  {
    title: "Test task",
    assignedTo: "David",
    deadline: "2026-09-01",
    unit: "Operations",
    status: "Not started"
  },
  {
    title: "Transfer training results",
    assignedTo: "Dalu",
    deadline: "2026-12-12",
    unit: "Human Resources",
    status: "Not started"
  },
  {
    title: "File client correspondence",
    assignedTo: "Dalu",
    deadline: "2026-09-26",
    unit: "Client Services",
    status: "In progress"
  },
  {
    title: "Prepare weekly office summary",
    assignedTo: "Dalu",
    deadline: "2026-09-29",
    unit: "Operations",
    status: "Not started"
  }
];

let workUpdates = [
  {
    date: "2026-09-21",
    unit: "Operations",
    staff: "Ada",
    client: "Internal operations",
    taskTitle: "Prepare monthly report",
    summary: "Prepared the weekly operations report and shared the next actions."
  },
  {
    date: "2026-09-21",
    unit: "Client Services",
    staff: "David",
    client: "Greenfield Ltd",
    taskTitle: "Reply to client email",
    summary: "Followed up on the client's request and recorded the agreed next step."
  }
];

const loginScreen = document.querySelector("#login-screen");
const workspace = document.querySelector("#workspace");
const chooseAccountButton = document.querySelector("#choose-account-button");
const accountCards = document.querySelector("#account-cards");
const roleText = document.querySelector("#role-text");
const welcomeText = document.querySelector("#welcome-text");
const adminPanel = document.querySelector("#admin-panel");
const deleteArea = document.querySelector("#delete-area");
const taskList = document.querySelector("#task-list");
const taskDetailScreen = document.querySelector("#task-detail-screen");
const taskDetailTitle = document.querySelector("#task-detail-title");
const taskDetailUnit = document.querySelector("#task-detail-unit");
const taskDetailDeadline = document.querySelector("#task-detail-deadline");
const taskDetailStatus = document.querySelector("#task-detail-status");
const workUpdatePanel = document.querySelector("#work-update-panel");
const workUpdateTitle = document.querySelector("#work-update-title");
const selectedTaskNote = document.querySelector("#selected-task-note");
const adminActivityPanel = document.querySelector("#admin-activity-panel");
const adminActivityDate = document.querySelector("#admin-activity-date");
const adminActivityList = document.querySelector("#admin-activity-list");
const calendarGrid = document.querySelector("#calendar-grid");

adminActivityDate.value = new Date().toISOString().slice(0, 10);

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
      (selectedFilter === "not-started" && task.status === "Not started") ||
      (selectedFilter === "in-progress" && task.status === "In progress") ||
      (selectedFilter === "completed" && task.status === "Completed");

    return matchesSearch && matchesFilter;
  });

  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    taskList.innerHTML = "<p>No matching tasks found.</p>";
    return;
  }

  filteredTasks.forEach(item => {
    const task = item.task;
    const isStaffTask = currentUser.role === "staff";

    taskList.innerHTML += `
      <article class="task-item ${isStaffTask ? "staff-task-card" : ""}" ${isStaffTask ? `data-task-number="${item.number}" tabindex="0"` : ""}>
        <h3>${item.number}. ${task.title}</h3>
        <p><strong>Responsible:</strong> ${task.assignedTo}</p>
        <p><strong>Deadline:</strong> ${task.deadline}</p>
        <p><strong>Unit:</strong> ${task.unit}</p>
        <span class="status ${getStatusClass(task)}">${task.status}</span>
      </article>
    `;
  });

  document.querySelectorAll(".staff-task-card").forEach(card => {
    card.addEventListener("click", () => openTask(Number(card.dataset.taskNumber)));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        openTask(Number(card.dataset.taskNumber));
      }
    });
  });
}

function openTask(taskNumber) {
  const task = tasks[taskNumber - 1];

  if (!task || currentUser.role !== "staff") {
    return;
  }

  selectedTaskIndex = taskNumber - 1;
  const selectedTask = tasks[selectedTaskIndex];

  taskDetailTitle.textContent = selectedTask.title;
  taskDetailUnit.textContent = selectedTask.unit;
  taskDetailDeadline.textContent = selectedTask.deadline;
  taskDetailStatus.value = selectedTask.status;
  workUpdateTitle.textContent = `Work Update: ${selectedTask.title}`;
  selectedTaskNote.textContent = "Record the work you completed for this task.";

  workspace.classList.add("hidden");
  taskDetailScreen.classList.remove("hidden");
}

function showAdminActivity() {
  const selectedDate = adminActivityDate.value;
  const updatesForDate = workUpdates.filter(update => update.date === selectedDate);

  showCalendar();
  adminActivityList.innerHTML = "";

  if (updatesForDate.length === 0) {
    adminActivityList.innerHTML =
      "<p class=\"panel-note\">No staff activity was recorded for this date.</p>";
    return;
  }

  updatesForDate.forEach(update => {
    adminActivityList.innerHTML += `
      <article class="task-item work-update-item">
        <h3>${update.unit} • ${update.staff}</h3>
        <p><strong>Client / case:</strong> ${update.client}</p>
        <p><strong>Work completed:</strong> ${update.summary}</p>
      </article>
    `;
  });
}

function showCalendar() {
  const selectedDate = new Date(`${adminActivityDate.value}T00:00:00`);
  const monday = new Date(selectedDate);
  const dayOffset = (selectedDate.getDay() + 6) % 7;
  monday.setDate(selectedDate.getDate() - dayOffset);

  calendarGrid.innerHTML = "";

  for (let index = 0; index < 7; index += 1) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const dateKey = day.toISOString().slice(0, 10);
    const count = workUpdates.filter(update => update.date === dateKey).length;
    const isSelected = dateKey === adminActivityDate.value;

    calendarGrid.innerHTML += `
      <button class="calendar-day ${isSelected ? "is-selected" : ""}" data-date="${dateKey}">
        <span class="calendar-day-name">${day.toLocaleDateString("en-US", { weekday: "short" })}</span>
        <span class="calendar-day-number">${day.getDate()}</span>
        <span class="calendar-day-count">${count} update${count === 1 ? "" : "s"}</span>
      </button>
    `;
  }

  document.querySelectorAll(".calendar-day").forEach(day => {
    day.addEventListener("click", () => {
      adminActivityDate.value = day.dataset.date;
      showAdminActivity();
    });
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
    adminActivityPanel.classList.remove("hidden");
    showAdminActivity();
  } else {
    adminPanel.classList.add("hidden");
    deleteArea.classList.add("hidden");
    adminActivityPanel.classList.add("hidden");
    workspace.classList.add("staff-workspace");
  }

  if (currentUser.role === "admin") {
    workspace.classList.remove("staff-workspace");
  }

  updateMetrics(visibleTasks);
  showTasks();
}

chooseAccountButton.addEventListener("click", () => {
  chooseAccountButton.classList.add("hidden");
  accountCards.classList.remove("hidden");
});

document.querySelectorAll("#account-cards .account-card").forEach(card => {
  card.addEventListener("click", () => {
    currentUser = users[card.dataset.account];
    selectedTaskIndex = null;

    loginScreen.classList.add("hidden");
    workspace.classList.remove("hidden");

    renderApp();
  });
});

document.querySelector("#logout-button").addEventListener("click", () => {
  currentUser = null;
  selectedTaskIndex = null;

  workspace.classList.add("hidden");
  taskDetailScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  chooseAccountButton.classList.remove("hidden");
  accountCards.classList.add("hidden");

});

document.querySelector("#back-to-tasks-button").addEventListener("click", () => {
  taskDetailScreen.classList.add("hidden");
  workspace.classList.remove("hidden");
  renderApp();
});

taskDetailStatus.addEventListener("change", () => {
  const selectedTask = tasks[selectedTaskIndex];

  if (currentUser?.role === "staff" && selectedTask) {
    selectedTask.status = taskDetailStatus.value;
  }
});

document.querySelector("#save-work-update-button").addEventListener("click", () => {
  const date = document.querySelector("#work-date").value;
  const client = document.querySelector("#work-client").value.trim();
  const summary = document.querySelector("#work-summary").value.trim();
  const selectedTask = tasks[selectedTaskIndex];

  if (!selectedTask || date === "" || client === "" || summary === "") {
    alert("Please add a date, client or case, and work summary.");
    return;
  }

  workUpdates.push({
    date,
    unit: selectedTask.unit,
    staff: currentUser.name,
    client,
    summary,
    taskTitle: selectedTask.title
  });

  document.querySelector("#work-client").value = "";
  document.querySelector("#work-summary").value = "";
});

document.querySelector("#add-task-button").addEventListener("click", () => {
  const title = document.querySelector("#task-title").value.trim();
  const unit = document.getElementById("task-unit").value;
  const person = document.querySelector("#task-person").value.trim();
  const deadline = document.querySelector("#task-deadline").value;

  if (title === "" || person === "" || deadline === "") {
    alert("Please fill in every task box.");
    return;
  }

  tasks.push({
    title,
    assignedTo: person,
    deadline,
    unit,
    status: "Not started"
  });

  document.querySelector("#task-title").value = "";
  document.querySelector("#task-person").value = "";
  document.querySelector("#task-deadline").value = "";

  renderApp();
});

document.querySelector("#delete-button").addEventListener("click", () => {
  if (currentUser.role !== "admin") {
    alert("Only the administrator can delete a task.");
    return;
  }

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

adminActivityDate.addEventListener("change", showAdminActivity);
