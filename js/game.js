// Game state
const gameState = {
  hunger: 100,
  happiness: 100,
  energy: 100,
  sleeping: false,
  lastUpdate: Date.now(),
};

// Generate clouds
function generateClouds() {
  const cloudsContainer = document.getElementById("clouds");
  for (let i = 0; i < 5; i++) {
    const cloud = document.createElement("div");
    const size = Math.random() * 50 + 50;
    const top = Math.random() * 200;
    const duration = Math.random() * 60 + 60;
    const delay = Math.random() * 60;

    cloud.className = "cloud";
    cloud.style.width = `${size}px`;
    cloud.style.height = `${size / 2}px`;
    cloud.style.top = `${top}px`;
    cloud.style.animationDuration = `${duration}s`;
    cloud.style.animationDelay = `${delay}s`;

    cloudsContainer.appendChild(cloud);
  }
}

// Create sparkle effect
function createSparkle(x, y) {
  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  document.getElementById("panda-container").appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 800);
}

// Update stats display
function updateStats() {
  document.getElementById("hunger-bar").style.width = `${gameState.hunger}%`;
  document.getElementById("hunger-value").textContent = `${Math.round(
    gameState.hunger
  )}%`;

  document.getElementById(
    "happiness-bar"
  ).style.width = `${gameState.happiness}%`;
  document.getElementById("happiness-value").textContent = `${Math.round(
    gameState.happiness
  )}%`;

  document.getElementById("energy-bar").style.width = `${gameState.energy}%`;
  document.getElementById("energy-value").textContent = `${Math.round(
    gameState.energy
  )}%`;

  // Update message based on stats
  const message = document.getElementById("message");
  if (gameState.sleeping) {
    message.textContent = "Zzz... Seu panda está dormindo! 😴💤";
  } else if (gameState.hunger < 30) {
    message.textContent = "Seu panda está com fome! 🍃😥";
  } else if (gameState.happiness < 30) {
    message.textContent = "Seu panda está triste! 😢💔";
  } else if (gameState.energy < 30) {
    message.textContent = "Seu panda está cansado! 😪💤";
  } else if (gameState.happiness > 80 && gameState.hunger > 80) {
    message.textContent = "Seu panda está super feliz! 🥰✨";
  } else {
    message.textContent = "Seu panda está feliz! 😊💖";
  }

  // Update sleep bubble
  document.getElementById("sleep-bubble").style.opacity = gameState.sleeping
    ? "1"
    : "0";

  // Update panda appearance
  updatePandaAppearance();
}

// Update panda appearance based on stats
function updatePandaAppearance() {
  const eyes = document.getElementById("eyes");
  const closedEyes = document.getElementById("closed-eyes");
  const mouth = document.getElementById("mouth");
  const leftBlush = document.getElementById("left-blush");
  const rightBlush = document.getElementById("right-blush");
  const leftPupil = document.getElementById("left-pupil");
  const rightPupil = document.getElementById("right-pupil");

  if (gameState.sleeping) {
    eyes.style.display = "none";
    closedEyes.style.display = "block";
    mouth.setAttribute("d", "M90,95 Q100,98 110,95");
    leftBlush.setAttribute("opacity", "0.4");
    rightBlush.setAttribute("opacity", "0.4");
  } else {
    eyes.style.display = "block";
    closedEyes.style.display = "none";

    // Adjust pupils based on happiness
    if (gameState.happiness > 80) {
      leftPupil.setAttribute("ry", "10");
      rightPupil.setAttribute("ry", "10");
      leftBlush.setAttribute("opacity", "0.8");
      rightBlush.setAttribute("opacity", "0.8");
    } else if (gameState.happiness < 30) {
      leftPupil.setAttribute("ry", "6");
      rightPupil.setAttribute("ry", "6");
      leftBlush.setAttribute("opacity", "0.2");
      rightBlush.setAttribute("opacity", "0.2");
    } else {
      leftPupil.setAttribute("ry", "8");
      rightPupil.setAttribute("ry", "8");
      leftBlush.setAttribute("opacity", "0.6");
      rightBlush.setAttribute("opacity", "0.6");
    }

    // Adjust mouth based on happiness
    if (gameState.happiness < 30) {
      mouth.setAttribute("d", "M85,100 Q100,90 115,100"); // Sad mouth
    } else if (gameState.happiness > 80) {
      mouth.setAttribute("d", "M80,95 Q100,110 120,95"); // Very happy mouth
    } else {
      mouth.setAttribute("d", "M85,95 Q100,105 115,95"); // Happy mouth
    }
  }
}

// Feed the panda
function feedPanda() {
  if (gameState.sleeping) return;

  const pandaContainer = document.getElementById("panda-container");

  // Create bamboo
  const bamboo = document.createElement("div");
  bamboo.className = "bamboo";
  bamboo.style.position = "absolute";
  bamboo.style.top = "50%";
  bamboo.style.left = "50%";
  bamboo.style.transform = "translate(-50%, -50%)";
  bamboo.style.zIndex = "10";

  // Add leaf
  const leaf = document.createElement("div");
  leaf.className = "bamboo-leaf";
  bamboo.appendChild(leaf);
  pandaContainer.appendChild(bamboo);

  // Animate bamboo
  setTimeout(() => {
    bamboo.style.transform = "translate(-50%, -50%) scale(0.8)";
    bamboo.style.opacity = "0";

    // Increase hunger
    gameState.hunger = Math.min(100, gameState.hunger + 20);
    updateStats();

    // Add bounce animation to panda
    const pandaSvg = document.getElementById("panda-svg");
    pandaSvg.classList.add("bounce");
    setTimeout(() => {
      pandaSvg.classList.remove("bounce");
      bamboo.remove();
    }, 500);
  }, 1000);

  document.getElementById("message").textContent = "Nyam nyam! Delicioso! 🎋😋";
}

// Pet the panda
function petPanda() {
  if (gameState.sleeping) return;

  const pandaContainer = document.getElementById("panda-container");

  // Add hearts
  for (let i = 0; i < 5; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = ["❤", "💕", "💖", "💗"][Math.floor(Math.random() * 4)];
    heart.style.left = `${Math.random() * 80 + 10}%`;
    heart.style.top = `${Math.random() * 50}%`;
    heart.style.animationDelay = `${i * 0.2}s`;

    pandaContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }

  // Create sparkles
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      createSparkle(Math.random() * 200 + 25, Math.random() * 150 + 25);
    }, i * 200);
  }

  // Add shake animation to panda
  const pandaSvg = document.getElementById("panda-svg");
  pandaSvg.classList.add("shake");

  // Increase blush temporarily
  const leftBlush = document.getElementById("left-blush");
  const rightBlush = document.getElementById("right-blush");
  leftBlush.setAttribute("opacity", "1");
  rightBlush.setAttribute("opacity", "1");

  setTimeout(() => {
    pandaSvg.classList.remove("shake");
    updatePandaAppearance(); // Reset blush to normal
  }, 500);

  // Increase happiness
  gameState.happiness = Math.min(100, gameState.happiness + 15);
  updateStats();

  document.getElementById("message").textContent =
    "Seu panda adora carinho! 🥰💕";
}

// Give bath to panda
function bathPanda() {
  if (gameState.sleeping) return;

  const pandaContainer = document.getElementById("panda-container");
  const pandaSvg = document.getElementById("panda-svg");

  // Create bubbles
  for (let i = 0; i < 10; i++) {
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.style.width = Math.random() * 15 + 5 + "px";
    bubble.style.height = bubble.style.width;
    bubble.style.left = Math.random() * 200 + "px";
    bubble.style.animationDelay = Math.random() * 2 + "s";

    const bubbles = document.createElement("div");
    bubbles.className = "bubbles";
    bubbles.appendChild(bubble);
    pandaContainer.appendChild(bubbles);

    setTimeout(() => bubbles.remove(), 3000);
  }

  // Add effects
  pandaSvg.classList.add("shake");
  setTimeout(() => pandaSvg.classList.remove("shake"), 500);

  // Improve stats
  gameState.happiness = Math.min(100, gameState.happiness + 10);
  updateStats();

  document.getElementById("message").textContent = "Que banho relaxante! 🛁✨";
}

// Play with panda
function playWithPanda() {
  if (gameState.sleeping) return;

  const pandaContainer = document.getElementById("panda-container");
  const pandaSvg = document.getElementById("panda-svg");

  // Create toy
  const toy = document.createElement("div");
  toy.className = "toy";
  toy.innerHTML = ["🎈", "🎾", "🧸", "⭐"][Math.floor(Math.random() * 4)];
  toy.style.left = Math.random() * 200 + 25 + "px";
  toy.style.top = "50px";

  pandaContainer.appendChild(toy);

  // Add effects
  pandaSvg.classList.add("bounce");
  setTimeout(() => {
    pandaSvg.classList.remove("bounce");
    toy.remove();
  }, 1000);

  // Create sparkles
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      createSparkle(Math.random() * 200 + 25, Math.random() * 150 + 25);
    }, i * 200);
  }

  // Improve stats
  gameState.happiness = Math.min(100, gameState.happiness + 15);
  gameState.energy = Math.max(0, gameState.energy - 5);
  updateStats();

  document.getElementById("message").textContent = "Que divertido! 🎮✨";
}

// Toggle sleep
function toggleSleep() {
  gameState.sleeping = !gameState.sleeping;

  if (gameState.sleeping) {
    document.getElementById("message").textContent =
      "Zzz... Seu panda está dormindo! 😴💤";
    document.getElementById("sleep-btn").innerHTML = "<span>🌞 Acordar</span>";
  } else {
    document.getElementById("message").textContent = "Seu panda acordou! 🌞✨";
    document.getElementById("sleep-btn").innerHTML = "<span>😴 Dormir</span>";
  }

  updateStats();
}

// Update game state over time
function updateGameState() {
  if (gameState.sleeping) {
    gameState.energy = Math.min(100, gameState.energy + 1);
  } else {
    const now = Date.now();
    const elapsed = (now - gameState.lastUpdate) / 1000; // seconds

    gameState.hunger = Math.max(0, gameState.hunger - elapsed * 0.2);
    gameState.happiness = Math.max(0, gameState.happiness - elapsed * 0.15);
    gameState.energy = Math.max(0, gameState.energy - elapsed * 0.1);

    gameState.lastUpdate = now;
  }
  updateStats();
}

// Initialize game
function initGame() {
  generateClouds();
  updateStats();

  // Add event listeners
  document.getElementById("feed-btn").addEventListener("click", feedPanda);
  document.getElementById("pet-btn").addEventListener("click", petPanda);
  document.getElementById("sleep-btn").addEventListener("click", toggleSleep);
  document.getElementById("bath-btn").addEventListener("click", bathPanda);
  document.getElementById("play-btn").addEventListener("click", playWithPanda);
  document.getElementById("panda-svg").addEventListener("click", petPanda);

  // Update game state every second
  setInterval(updateGameState, 1000);

  // Initial message
  document.getElementById("message").textContent =
    "Olá! Cuide bem de mim! 🐼💕";
}

// Start the game when page loads
window.addEventListener("load", initGame);
