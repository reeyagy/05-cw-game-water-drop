// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let catchChecker;
let score = 0;
const scoreDisplay = document.getElementById("score");
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
  scoreDisplay.textContent = score;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
  catchChecker = setInterval(checkForCaughtDrops, 50);
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
