/* ---------------------------
   CONFIG
---------------------------- */

// Number range
const MIN = 1;
const MAX = 999;

// Initial timing window (ms)
const START_MIN_DELAY = 180;
const START_MAX_DELAY = 650;

// Hard floors so it never becomes literally impossible
const MIN_DELAY_FLOOR = 60;
const MAX_DELAY_FLOOR = 180;

// How fast the game accelerates with success
const MIN_DELAY_STEP = 3;
const MAX_DELAY_STEP = 6;

// Extra randomness to destroy rhythm
const JITTER = 70;

/* ---------------------------
   STATE
---------------------------- */

let current = 0;
let score = 0;
let timer = null;

const numberEl = document.getElementById("number");
const tapBtn = document.getElementById("tap");

/* ---------------------------
   HELPERS
---------------------------- */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function computeDelay() {
  const minDelay = Math.max(
    MIN_DELAY_FLOOR,
    START_MIN_DELAY - score * MIN_DELAY_STEP
  );

  const maxDelay = Math.max(
    MAX_DELAY_FLOOR,
    START_MAX_DELAY - score * MAX_DELAY_STEP
  );

  const base = randInt(minDelay, maxDelay);
  const jitter = randInt(-JITTER, JITTER);

  return Math.max(20, base + jitter);
}

/* ---------------------------
   GAME LOOP
---------------------------- */

function nextNumber() {
  current = randInt(MIN, MAX);
  numberEl.textContent = current;
}

function scheduleNext() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    nextNumber();
    scheduleNext();
  }, computeDelay());
}

function fail() {
  score = 0;
  numberEl.textContent = "X";
  setTimeout(() => {
    nextNumber();
  }, 200);
}

/* ---------------------------
   INPUT
---------------------------- */

tapBtn.addEventListener("click", () => {
  if (current % 2 === 1) {
    score++;
    nextNumber();     // immediate change on success
    scheduleNext();   // faster, tighter timing
  } else {
    fail();
    scheduleNext();
  }
});

/* ---------------------------
   START
---------------------------- */

nextNumber();
scheduleNext();

/* ---------------------------
   SERVICE WORKER (optional)
---------------------------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/odd-only/sw.js");
  });
}
