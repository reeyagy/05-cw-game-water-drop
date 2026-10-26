// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let catchChecker;
let countdown;
let timeRemaining = 30;
let score = 0;
const winningMessages = [
  "Amazing catch! You won!",
  "Great job! You reached the goal!",
  "You're a water-saving champion!",
];
const losingMessages = [
  "Nice try! Play again to reach 20 points.",
  "Keep practicing—you can do it!",
  "Almost there! Give it another try.",
];
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameResult = document.getElementById("game-result");
const gameContainer = document.getElementById("game-container");
const bucket = document.getElementById("bucket");

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

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeRemaining = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeRemaining;
  gameResult.hidden = true;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
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
  clearInterval(catchChecker);
  clearInterval(countdown);
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  const messages = score >= 20 ? winningMessages : losingMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  gameResult.textContent = `Final score: ${score}. ${randomMessage}`;
  gameResult.hidden = false;
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

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

function checkForCaughtDrops() {
  if (!gameRunning) return;

  const bucketBounds = bucket.getBoundingClientRect();

  gameContainer.querySelectorAll(".water-drop").forEach((drop) => {
    if (drop.dataset.caught) return;

    const dropBounds = drop.getBoundingClientRect();
    const touchesBucket =
      dropBounds.right > bucketBounds.left &&
      dropBounds.left < bucketBounds.right &&
      dropBounds.bottom > bucketBounds.top &&
      dropBounds.top < bucketBounds.bottom;

    if (touchesBucket) {
      drop.dataset.caught = "true";
      score += 1;
      scoreDisplay.textContent = score;
      drop.remove();
    }
  });
}
