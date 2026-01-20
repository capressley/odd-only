<script>
let current = 0;
let score = 0;
let strikes = 0;

// MUCH slower start + much higher minimum delay (slower game)
let speed = 900;          // starting ms between number changes
const MIN_SPEED = 520;    // fastest it will EVER get (bigger = slower)

let timer = null;
let running = true;
let tapCooldown = false;

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

  // Erratic, but gentle
  const jitter = 0.90 + Math.random() * 0.25; // 0.90–1.15

  // Very slow ramp: only slightly faster as score rises
  const ramp = 3 + (score * 0.25); // tiny acceleration
  speed = Math.max(MIN_SPEED, speed - ramp);

  timer = setTimeout(nextTick, Math.round(speed * jitter));
}

buttonEl.addEventListener("click", () => {
  if (!running) return;
  if (tapCooldown) return;

  tapCooldown = true;

  if (current % 2 === 1) {
    score++;
  } else {
    strikes++;
  }

  updateDisplay();

  // Give player breathing room after a tap (prevents “machine-gun loss”)
  clearTimeout(timer);
  setTimeout(() => {
    tapCooldown = false;

    if (strikes >= 3) {
      endGame();
    } else {
      nextTick();
    }
  }, 250);
});

function endGame() {
  running = false;
  clearTimeout(timer);
  numberEl.textContent = "GAME OVER";

  setTimeout(() => {
    const initials = prompt("GAME OVER\nEnter your initials (3 letters):", "AAA");
    if (initials) saveScore(initials.toUpperCase().slice(0, 3), score);
    showHighScores();
    if (confirm("Play again?")) resetGame();
  }, 350);
}

function resetGame() {
  score = 0;
  strikes = 0;
  speed = 900;
  running = true;
  tapCooldown = false;
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
  if (!scores.length) text += "No scores yet.\n";
  scores.forEach((s, i) => {
    text += `${i + 1}. ${s.initials} — ${s.score}\n`;
  });
  alert(text);
}

// Start game
nextTick();
</script>
