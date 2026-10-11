const TOTAL = 21;
const board = document.getElementById("board");
const turnEl = document.getElementById("turn");
const countEl = document.getElementById("count");
const resultEl = document.getElementById("result");
const setup = document.getElementById("setup");
const takeButtons = [...document.querySelectorAll(".take-btn")];
const modeEl = document.getElementById("mode");
const difficultyEl = document.getElementById("difficulty");
const firstEl = document.getElementById("first");

let remaining = TOTAL;
let current = "human";
let mode = "cpu";
let difficulty = "hard";
let busy = false;

function renderBoard() {
  board.innerHTML = "";
  for (let i = 0; i < remaining; i += 1) {
    const stick = document.createElement("div");
    stick.className = "stick";
    stick.style.setProperty("--tilt", `${(i % 7) - 3}deg`);
    board.appendChild(stick);
  }
  countEl.textContent = `Осталось: ${remaining}`;
}

function setButtons() {
  const humanTurn = !busy && remaining > 0 && (mode === "hotseat" || current === "human");
  takeButtons.forEach((btn) => {
    const n = Number(btn.dataset.n);
    btn.disabled = !humanTurn || n > remaining;
  });
}

function describeTurn() {
  if (remaining <= 0) return;
  if (mode === "hotseat") {
    turnEl.textContent = current === "p1" ? "Ход игрока 1" : "Ход игрока 2";
    return;
  }
  turnEl.textContent = current === "human" ? "Ваш ход" : "Ход компьютера…";
}

function winnerText(loser) {
  if (mode === "hotseat") {
    const winner = loser === "p1" ? "Игрок 2" : "Игрок 1";
    return `${winner} победил: соперник взял последнюю палочку.`;
  }
  if (loser === "human") return "Компьютер победил: вы взяли последнюю палочку.";
  return "Вы победили: компьютер взял последнюю палочку.";
}

async function take(n, actor) {
  if (busy || n < 1 || n > 3 || n > remaining) return;
  busy = true;
  setButtons();

  const sticks = [...board.querySelectorAll(".stick:not(.gone)")].slice(-n);
  sticks.forEach((stick) => stick.classList.add("gone"));
  await wait(380);

  remaining -= n;
  renderBoard();

  if (remaining === 0) {
    turnEl.textContent = "Игра окончена";
    resultEl.hidden = false;
    resultEl.textContent = winnerText(actor);
    busy = false;
    setButtons();
    return;
  }

  if (mode === "hotseat") {
    current = actor === "p1" ? "p2" : "p1";
  } else {
    current = actor === "human" ? "cpu" : "human";
  }

  describeTurn();
  busy = false;
  setButtons();

  if (mode === "cpu" && current === "cpu" && remaining > 0) {
    await wait(520);
    const cpuTake = chooseCpu(remaining, difficulty);
    await take(cpuTake, "cpu");
  }
}

function chooseCpu(left, level) {
  if (left === 1) return 1;
  if (level === "easy") {
    return 1 + Math.floor(Math.random() * Math.min(3, left));
  }
  const mod = left % 4;
  if (mod === 1) return 1 + Math.floor(Math.random() * Math.min(3, left - 1 || 1));
  return mod === 0 ? 3 : mod - 1;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startGame(event) {
  event?.preventDefault();
  mode = modeEl.value;
  difficulty = difficultyEl.value;
  remaining = TOTAL;
  resultEl.hidden = true;
  busy = false;
  renderBoard();

  if (mode === "hotseat") {
    current = "p1";
    difficultyEl.disabled = true;
    firstEl.disabled = true;
    describeTurn();
    setButtons();
    return;
  }

  difficultyEl.disabled = false;
  firstEl.disabled = false;
  current = firstEl.value === "cpu" ? "cpu" : "human";
  describeTurn();
  setButtons();
  if (current === "cpu") {
    take(chooseCpu(remaining, difficulty), "cpu");
  }
}

modeEl.addEventListener("change", () => {
  const vsCpu = modeEl.value === "cpu";
  difficultyEl.disabled = !vsCpu;
  firstEl.disabled = !vsCpu;
});

takeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const n = Number(btn.dataset.n);
    const actor = mode === "hotseat" ? current : "human";
    take(n, actor);
  });
});

setup.addEventListener("submit", startGame);
startGame();
