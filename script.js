const mainMenu = document.getElementById("main-menu");
const playButton = document.getElementById("play-button");
const game = document.getElementById("game");
const imageQueue = document.getElementById("image-queue");
const player = document.getElementById("player");
const timerElement = document.getElementById("timer");
const bgm = document.getElementById("bgm");
const sfxShoot = document.getElementById("sfx-shoot");
const sfxHit = document.getElementById("sfx-hit");
const endScreen = document.getElementById("end-screen");
const retryButton = document.getElementById("retry-button");
const feedback = document.createElement("div");

document.body.appendChild(feedback);

let realHits = 0; // Track real hits
let fakeHits = 0; // Track fake hits
let shotsFired = 0;
let isShooting = false;
let timer = 60; // 60-second timer

// Style feedback element
feedback.style.position = "fixed";
feedback.style.transform = "translate(-50%, -50%)";
feedback.style.display = "none";
feedback.style.zIndex = "1000";

// Main menu "Play Now" button
playButton.addEventListener("click", () => {
  mainMenu.style.display = "none";
  game.style.display = "block";
  bgm.play();
  startGame();
});

// Create the image queue
const imageTypes = [
  ...Array.from({ length: 40 }, (_, i) => `real${i + 1}.png`),
  ...Array.from({ length: 60 }, (_, i) => `fake${i + 1}.png`),
];
const shuffledImages = imageTypes.sort(() => Math.random() - 0.5);

shuffledImages.forEach((imgName) => {
  const img = document.createElement("img");
  img.src = `assets/${imgName}`;
  img.dataset.type = imgName.includes("real") ? "real" : "fake";
  img.style.width = "300px";
  img.style.height = "300px";
  imageQueue.appendChild(img);
});

// Move image queue from left to right
function moveImageQueue() {
  let position = -imageQueue.scrollWidth;
  setInterval(() => {
    position += 2.5; // Adjust speed here
    if (position > window.innerWidth) {
      position = -imageQueue.scrollWidth;
    }
    imageQueue.style.transform = `translateX(${position}px)`;
  }, 20);
}

// Player movement
window.addEventListener("keydown", (e) => {
  const playerRect = player.getBoundingClientRect();
  const gameRect = game.getBoundingClientRect();

  if (e.key === "ArrowLeft" && playerRect.left > gameRect.left) {
    player.style.left = `${player.offsetLeft - 30}px`;
  }
  if (e.key === "ArrowRight" && playerRect.right < gameRect.right) {
    player.style.left = `${player.offsetLeft + 30}px`;
  }
  if (e.key === " " && !isShooting) {
    shootGoldcoin();
  }
});

// Shooting logic
function shootGoldcoin() {
  isShooting = true;
  shotsFired++;
  sfxShoot.play();

  const coin = document.createElement("div");
  coin.classList.add("goldcoin");
  coin.style.left = `${player.offsetLeft + player.offsetWidth / 2 - 15}px`;
  coin.style.top = `${player.offsetTop - 20}px`;

  game.appendChild(coin);

  const moveBullet = setInterval(() => {
    coin.style.top = `${coin.offsetTop - 10}px`;

    if (coin.offsetTop <= 0) {
      clearBullet(coin, moveBullet);
    }

    const images = Array.from(imageQueue.children);
    images.forEach((img) => {
      const imgRect = img.getBoundingClientRect();
      const coinRect = coin.getBoundingClientRect();

      if (
        coinRect.left < imgRect.right &&
        coinRect.right > imgRect.left &&
        coinRect.top < imgRect.bottom &&
        coinRect.bottom > imgRect.top
      ) {
        handleHit(img);
        clearBullet(coin, moveBullet);
      }
    });
  }, 20);
}

// Handle hit
function handleHit(img) {
  const imgType = img.dataset.type;

  if (imgType === "real") {
    realHits++;
    sfxHit.play(); // Play hit sound for real images
    flashScreen("yellow");
    showFeedback("assets/NICE.gif");
  } else {
    fakeHits++;
    const sfxError = new Audio("assets/error.mp3");
    sfxError.play(); // Play error sound for fake images
    flashScreen("red");
    showFeedback("assets/OOPS.gif");
  }

  img.classList.add("shrinking");
  setTimeout(() => img.remove(), 500);
}

// Flash screen effect
function flashScreen(color) {
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100%";
  flash.style.height = "100%";
  flash.style.backgroundColor = color;
  flash.style.opacity = "0.5";
  flash.style.zIndex = "999";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 100); // Flash for 100ms
}

// Show feedback GIF
function showFeedback(gifPath, position = { top: "50%", left: "50%" }) {
  feedback.style.display = "block";
  feedback.style.top = position.top;
  feedback.style.left = position.left;
  feedback.innerHTML = `<img src="${gifPath}" alt="Feedback" style="width: 300px; height: auto;">`;

  // Hide feedback after 1 second
  setTimeout(() => {
    feedback.style.display = "none";
    feedback.innerHTML = "";
  }, 1000);
}

// Clear bullet
function clearBullet(coin, interval) {
  clearInterval(interval);
  coin.remove();
  isShooting = false;
}

// Start game
function startGame() {
  moveImageQueue();

  let remainingTime = timer;

  // Update the timer every second
  const timerInterval = setInterval(() => {
    remainingTime--;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerElement.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  bgm.pause();
  game.style.display = "none";
  endScreen.style.display = "flex";

  document.getElementById("real-hits").textContent = `Real Hits: ${realHits}`;
  document.getElementById("fake-hits").textContent = `Fake Hits: ${fakeHits}`;
}

// Retry button functionality
retryButton.addEventListener("click", () => {
  location.reload();
});
