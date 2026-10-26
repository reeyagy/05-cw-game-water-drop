// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let bottleMaker;
let catchChecker;
let countdown;
let confettiCleanup;
let timeRemaining = 30;
let score = 0;
const winningMessages = [
  "Amazing catch! You won!",
  "Great job! You reached the goal!",
  "You're a water-saving champion!",
];
const losingMessages = [
  "Nice try! Play again to reach 20 points.",
  "Keep practicing, you can do it!",
  "Almost there! Give it another try.",
];
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameResult = document.getElementById("game-result");
const gameContainer = document.getElementById("game-container");
const bucket = document.getElementById("bucket");
let confettiOverlay;

gameContainer.addEventListener("pointermove", (event) => {
  const containerBounds = gameContainer.getBoundingClientRect();
  const bucketWidth = bucket.offsetWidth;
  const pointerX = event.clientX - containerBounds.left - gameContainer.clientLeft;
  const bucketLeft = Math.max(
    0,
    Math.min(pointerX - bucketWidth / 2, gameContainer.clientWidth - bucketWidth)
  );
  bucket.style.left = `${bucketLeft}px`;
});

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  clearConfetti();
  gameRunning = true;
  score = 0;
  timeRemaining = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeRemaining;
  gameResult.hidden = true;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
  bottleMaker = setInterval(createBottle, 2200);
  catchChecker = setInterval(checkForCaughtDrops, 50);
  countdown = setInterval(() => {
    timeRemaining -= 1;
    timeDisplay.textContent = timeRemaining;

    if (timeRemaining === 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(bottleMaker);
  clearInterval(catchChecker);
  clearInterval(countdown);
  gameContainer.querySelectorAll(".water-drop, .plastic-bottle").forEach((item) => item.remove());

  const messages = score >= 20 ? winningMessages : losingMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  gameResult.textContent = `Final score: ${score}. ${randomMessage}`;
  gameResult.hidden = false;

  if (score >= 20) {
    showConfetti();
  }
}

function resetGame() {
  clearConfetti();
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(bottleMaker);
  clearInterval(catchChecker);
  clearInterval(countdown);
  gameContainer.querySelectorAll(".water-drop, .plastic-bottle").forEach((item) => item.remove());

  score = 0;
  timeRemaining = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeRemaining;
  gameResult.hidden = true;
  bucket.style.left = "calc(50% - 45px)";
}

function showConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A"];
  confettiOverlay = document.createElement("div");
  confettiOverlay.className = "confetti-overlay";
  confettiOverlay.setAttribute("aria-hidden", "true");

  for (let i = 0; i < 80; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${3 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    confettiOverlay.appendChild(piece);
  }

  document.body.appendChild(confettiOverlay);
  confettiCleanup = setTimeout(clearConfetti, 5200);
}

function clearConfetti() {
  clearTimeout(confettiCleanup);
  confettiOverlay?.remove();
  confettiOverlay = null;
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";
  drop.setAttribute("aria-hidden", "true");

  const dropShape = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  dropShape.setAttribute("viewBox", "0 0 100 100");
  dropShape.setAttribute("preserveAspectRatio", "none");
  const dropPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  dropPath.setAttribute(
    "d",
    "M50 2 C42 18 12 43 12 65 C12 84 29 98 50 98 C71 98 88 84 88 65 C88 43 58 18 50 2 Z"
  );
  dropPath.setAttribute("fill", "currentColor");
  dropShape.appendChild(dropPath);
  drop.appendChild(dropShape);

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Remove drops that reach the bottom without being caught
  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}

function createBottle() {
  const bottle = document.createElement("div");
  bottle.className = "plastic-bottle";
  bottle.setAttribute("aria-hidden", "true");

  const gameWidth = gameContainer.clientWidth;
  const bottleWidth = 36;
  bottle.style.left = `${Math.random() * (gameWidth - bottleWidth)}px`;
  bottle.style.animationDuration = "4.5s";

  gameContainer.appendChild(bottle);
  bottle.addEventListener("animationend", () => bottle.remove());
}

function checkForCaughtDrops() {
  if (!gameRunning) return;

  const bucketBounds = bucket.getBoundingClientRect();

  gameContainer.querySelectorAll(".water-drop, .plastic-bottle").forEach((item) => {
    if (item.dataset.caught) return;

    const itemBounds = item.getBoundingClientRect();
    const touchesBucket =
      itemBounds.right > bucketBounds.left &&
      itemBounds.left < bucketBounds.right &&
      itemBounds.bottom > bucketBounds.top &&
      itemBounds.top < bucketBounds.bottom;

    if (touchesBucket) {
      item.dataset.caught = "true";
      score = item.classList.contains("plastic-bottle")
        ? Math.max(0, score - 1)
        : score + 1;
      scoreDisplay.textContent = score;
      item.remove();
    }
  });
}
