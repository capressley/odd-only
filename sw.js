<script>
let current = 0;
let score = 0;
let strikes = 0;
let speed = 420;
let timer = null;
let running = true;

const numberEl = document.getElementById("number");
const buttonEl = document.getElementById("tap");
const scoreEl = document.getElementById("score");
const strikesEl = document.getElementById("strikes");

function randomNumber() {
  return Math.floor(Math.random() * 999) + 1;
}

function updateDisplay() {
  numberEl.textContent = current;
  scoreEl.textContent = score;
  strikesEl.textContent = "❌".repeat(strikes);
}

function nextTick() {
  if (!running) return;

  current = randomNumber();
  updateDisplay();

  // Erratic but playable timing
  const jitter = 0.85 + Math.random() * 0.30; // chaos
  speed = Math.max(240, speed - (6 + score * 0.15));
  timer = setTimeout(nextTick, Math.round(speed * jitter));
}

buttonEl.addEventListener("click", () => {
  if (!running) return;

  if (current % 2 === 1) {
    // Correct tap
    score++;
  } else {
    // Strike
    strikes++;
  }

  updateDisplay();

  if (strikes >= 3) {
    endGame();
  }
});

function endGame() {
  running = false;
  clearTimeout(timer);
  numberEl.textContent = "GAME OVER";

  setTimeout(() => {
    const initials = prompt("GAME OVER\nEnter your initials (3 letters):", "AAA");
    if (initials) saveScore(initials.toUpperCase(), score);
    showHighScores();
    if (confirm("Play again?")) resetGame();
  }, 300);
}

function resetGame() {
  score = 0;
  strikes = 0;
  speed = 420;
  running = true;
  nextTick();
}

function saveScore(initials, score) {
  const scores = JSON.parse(localStorage.getItem("oddOnlyScores") || "[]");
  scores.push({ initials, score });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem("oddOnlyScores", JSON.stringify(scores.slice(0, 10)));
}

function showHighScores() {
  const scores = JSON.parse(localStorage.getItem("oddOnlyScores") || "[]");
  let text = "🏆 HIGH SCORES 🏆\n\n";
  scores.forEach((s, i) => {
    text += `${i + 1}. ${s.initials} — ${s.score}\n`;
  });
  alert(text);
}

// Start game
nextTick();
</script>
