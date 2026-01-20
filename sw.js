<script>
  // HARD STOP: remove any service worker caching that might be breaking things
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
    });
  }

  const welcome = document.getElementById("welcome");
  const game = document.getElementById("game");
  const gameOver = document.getElementById("gameOver");

  const numberEl = document.getElementById("number");
  const startBtn = document.getElementById("startBtn");
  const tapBtn = document.getElementById("tapBtn");
  const restartBtn = document.getElementById("restartBtn");

  const imgStatus = document.getElementById("imgStatus");
  const welcomeImg = document.getElementById("welcomeImg");
  const overImg = document.getElementById("overImg");

  let current = 0;

  function show(screen) {
    welcome.classList.remove("active");
    game.classList.remove("active");
    gameOver.classList.remove("active");
    screen.classList.add("active");
  }

  function nextNumber() {
    current = Math.floor(Math.random() * 999) + 1; // 1..999
    numberEl.textContent = current;
  }

  startBtn.addEventListener("click", () => {
    show(game);
    nextNumber();
  });

  tapBtn.addEventListener("click", () => {
    if (current % 2 === 1) {
      nextNumber();
    } else {
      show(gameOver);
    }
  });

  restartBtn.addEventListener("click", () => {
    show(welcome);
  });

  // Debug info for the image (so we can SEE what’s wrong)
  welcomeImg.addEventListener("load", () => {
    imgStatus.textContent = "✅ Welcome image loaded.";
  });

  welcomeImg.addEventListener("error", () => {
    imgStatus.textContent =
      "❌ Welcome image failed to load. This usually means the filename/path is wrong or GitHub Pages hasn't updated yet.";
  });

  overImg.addEventListener("error", () => {
    console.log("Game-over image failed to load.");
  });
</script>
