// get any saved habits
const savedHabits = localStorage.getItem("habits");
const savedDarkmode = localStorage.getItem("darkmodePreference");
let habits = savedHabits ? JSON.parse(savedHabits) : [];
let darkmode = savedDarkmode === "true";

const addDiv = document.getElementById("addHabit");
const habitForm = document.getElementById("habitForm");
const habitNameInput = document.getElementById("habitNameInput");
const habitDateInput = document.getElementById("habitDateInput");
const habitTimeInput = document.getElementById("habitTimeInput");
const habitSubmit = document.getElementById("habitSubmit");
const habitCancel = document.getElementById("habitCancel");
const darkmodeCheck = document.getElementById("darkmode-check");

function addHabit(habitName, startDate, startTime) {
  let startIso = new Date(`${startDate}T${startTime}`).toISOString();
  habits.push({ name: habitName, iso: startIso });
  localStorage.setItem("habits", JSON.stringify(habits));
  displayHabit(habitName, startIso);
}

function displayHabit(habitName, startIso) {
  let container = document.querySelector(".habits");
  let div = document.createElement("div");
  let h1 = document.createElement("h1");
  let p = document.createElement("p");
  div.className = "pledge";
  h1.textContent = habitName;
  p.dataset.start = startIso;
  p.className = "timer";

  // menu buttons, hidden initially
  let menu = document.createElement("div");
  menu.className = "menu";

  let resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset";

  let removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";

  menu.appendChild(resetBtn);
  menu.appendChild(removeBtn);

  let closeBtn = document.createElement("button");
  closeBtn.className = "close";
  closeBtn.textContent = "✕";

  div.appendChild(h1);
  div.appendChild(p);
  div.appendChild(menu);
  div.appendChild(closeBtn);
  container.insertBefore(div, addDiv);
  updateDeltas();

  div.addEventListener("click", (e) => {
    if (
      e.target === resetBtn ||
      e.target === removeBtn ||
      e.target === closeBtn
    )
      return;
    div.classList.add("open");
  });

  closeBtn.addEventListener("click", (e) => {
    // e.stopPropagation();
    div.classList.remove("open");
  });

  resetBtn.addEventListener("click", (e) => {
    // e.stopPropagation();
    let nowIso = new Date().toISOString();
    p.dataset.start = nowIso;

    let habit = habits.find((h) => h.name === habitName && h.iso === startIso);
    if (habit) habit.iso = nowIso;
    localStorage.setItem("habits", JSON.stringify(habits));

    div.classList.remove("open");
  });

  removeBtn.addEventListener("click", (e) => {
    // e.stopPropagation();
    habits = habits.filter(
      (h) => !(h.name === habitName && h.iso === startIso),
    );
    localStorage.setItem("habits", JSON.stringify(habits));

    div.remove();
  });
}

function resetForm() {
  habitNameInput.value = "";
  habitDateInput.value = "";
  habitTimeInput.value = "12:00";
}

function formatDelta(ms) {
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function updateDeltas() {
  const ps = document.querySelectorAll(".pledge p");

  ps.forEach((p) => {
    const startIso = p.dataset.start;
    if (!startIso) return;
    const delta = Date.now() - new Date(startIso).getTime();
    p.textContent = formatDelta(delta);
  });
}

function displayHabits() {
  for (let habit of habits) {
    displayHabit(habit.name, habit.iso);
  }
}

function setDarkmode() {
  document.querySelector("body").classList.add("darkmode");
  darkmode = true;
  localStorage.setItem("darkmodePreference", darkmode);
}

function removeDarkmode() {
  document.querySelector("body").classList.remove("darkmode");
  darkmode = false;
  localStorage.setItem("darkmodePreference", darkmode);
}

function checkValidDate(date, time) {
  let dateToCheck = new Date(`${date}T${time}`);
  if (Date.now() < dateToCheck || dateToCheck < new Date("1926-01-01")) {
    return false;
  }
  return true;
}

// event listeners
addDiv.addEventListener("click", () => {
  habitForm.style.display = "block";
});

habitCancel.addEventListener("click", () => {
  resetForm();
  habitForm.style.display = "none";
});

habitSubmit.addEventListener("click", () => {
  if (
    habitNameInput.value &&
    habitDateInput.value &&
    checkValidDate(habitDateInput.value, habitTimeInput.value)
  ) {
    addHabit(
      habitNameInput.value.trim(),
      habitDateInput.value,
      habitTimeInput.value,
    );
    resetForm();
    habitForm.style.display = "none";
  }
});

darkmodeCheck.addEventListener("click", () => {
  if (darkmode) {
    removeDarkmode();
  } else {
    setDarkmode();
  }
});

// set darkmode if applicable
if (darkmode) {
  darkmodeCheck.checked = true;
  setDarkmode();
}

// initially display habits
displayHabits();

// update time display every second
setInterval(updateDeltas, 1000);

