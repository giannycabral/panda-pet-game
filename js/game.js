// Game state
const gameState = {
  // Stats básicos
  hunger: 100,
  happiness: 100,
  energy: 100,
  sleeping: false,
  lastUpdate: Date.now(),

  // Sistema de níveis
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,

  // Conquistas
  achievements: {
    firstMeal: false,
    reachLevel5: false,
    perfectCare: false,
  },

  // Estatísticas totais
  stats: {
    totalFeeds: 0,
    totalPets: 0,
    totalSleeps: 0,
  },

  // Nova flag para controle de animação de acordar
  _wakingUp: false,
};

// Sistema de salvamento
function saveGame() {
  localStorage.setItem("pandaPetSave", JSON.stringify(gameState));
}

function loadGame() {
  const savedGame = localStorage.getItem("pandaPetSave");
  if (savedGame) {
    Object.assign(gameState, JSON.parse(savedGame));
    updateStats();
    updateLevel();
  }
}

// Generate clouds
function generateClouds() {
  const cloudsContainer = document.getElementById("clouds");
  cloudsContainer.innerHTML = ""; // Clear previous clouds
  for (let i = 0; i < 10; i++) {
    const cloud = document.createElement("div");
    let size, className;
    // Make 3 clouds larger for visual variety
    if (i < 3) {
      size = Math.random() * 80 + 120; // Larger clouds
      className = "cloud cloud-large";
    } else {
      size = Math.random() * 50 + 50;
      className = "cloud";
    }
    const top = Math.random() * 200;
    const duration = Math.random() * 60 + 60;
    const delay = Math.random() * 60;

    cloud.className = className;
    cloud.style.width = `${size}px`;
    cloud.style.height = `${size / 2}px`;
    cloud.style.top = `${top}px`;
    cloud.style.animationDuration = `${duration}s`;
    cloud.style.animationDelay = `${delay}s`;

    cloudsContainer.appendChild(cloud);
  }
  // Add sun or moon depending on time
  const sunId = "panda-sun";
  const moonId = "panda-moon";
  let sun = document.getElementById(sunId);
  let moon = document.getElementById(moonId);
  if (!isNight()) {
    if (moon) moon.remove();
    if (!sun) {
      sun = document.createElement("div");
      sun.id = sunId;
      sun.className = "sun";
      cloudsContainer.insertBefore(sun, cloudsContainer.firstChild);
    }
    // Remove dark mode if present
    document.body.classList.remove("night-mode");
  } else {
    if (sun) sun.remove();
    if (!moon) {
      moon = document.createElement("div");
      moon.id = moonId;
      moon.className = "moon";
      cloudsContainer.insertBefore(moon, cloudsContainer.firstChild);
    }
    // Enable dark mode
    document.body.classList.add("night-mode");
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

  // Update level display
  updateLevel();
}

// Update panda appearance based on stats
function updatePandaAppearance() {
  const pandaSvg = document.getElementById("panda-svg");
  const eyes = document.getElementById("eyes");
  const closedEyes = document.getElementById("closed-eyes");
  const mouth = document.getElementById("mouth");
  const leftBlush = document.getElementById("left-blush");
  const rightBlush = document.getElementById("right-blush");
  const leftPupil = document.getElementById("left-pupil");
  const rightPupil = document.getElementById("right-pupil");

  // Nova lógica para transição suave ao acordar
  if (gameState._wakingUp) {
    // Etapa intermediária: semi-sentado
    pandaSvg.style.transition = "transform 0.4s cubic-bezier(.4,0,.2,1)";
    pandaSvg.style.transform = "rotate(45deg) translate(40px, 40px) scale(1)";
    pandaSvg.style.transformOrigin = "50% 60%";
    setTimeout(() => {
      pandaSvg.style.transition = "transform 0.4s cubic-bezier(.4,0,.2,1)";
      pandaSvg.style.transform = "translateY(60px) scale(1)";
      pandaSvg.style.transformOrigin = "50% 100%";
      // Após a transição, remove flag e atualiza olhos/boca
      setTimeout(() => {
        gameState._wakingUp = false;
        eyes.style.display = "block";
        closedEyes.style.display = "none";
        // Ajusta pupilas e blush conforme felicidade
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
        // Ajusta boca conforme felicidade
        if (gameState.happiness < 30) {
          mouth.setAttribute("d", "M85,100 Q100,90 115,100"); // Sad mouth
        } else if (gameState.happiness > 80) {
          mouth.setAttribute("d", "M80,95 Q100,110 120,95"); // Very happy mouth
        } else {
          mouth.setAttribute("d", "M85,95 Q100,105 115,95"); // Happy mouth
        }
      }, 400);
    }, 400);
    // Durante o "levantar", mostra olhos fechados
    eyes.style.display = "none";
    closedEyes.style.display = "block";
    mouth.setAttribute("d", "M90,95 Q100,98 110,95");
    leftBlush.setAttribute("opacity", "0.4");
    rightBlush.setAttribute("opacity", "0.4");
    return;
  }

  if (gameState.sleeping) {
    eyes.style.display = "none";
    closedEyes.style.display = "block";
    mouth.setAttribute("d", "M90,95 Q100,98 110,95");
    leftBlush.setAttribute("opacity", "0.4");
    rightBlush.setAttribute("opacity", "0.4");
    // Panda deitado: rotaciona e centraliza no cenário
    pandaSvg.style.transform = "rotate(90deg) translate(60px, 60px) scale(1)";
    pandaSvg.style.transformOrigin = "50% 60%";
    pandaSvg.style.transition = "transform 0.7s cubic-bezier(.4,0,.2,1)";
  } else {
    // Quando o panda está acordado e não na animação de "acordar",
    // o mecanismo de piscar (startPandaBlinking) controlará
    // eyes.style.display e closedEyes.style.display.
    // Apenas ajustamos outros aspectos visuais aqui.
    // Ajusta pupilas e blush conforme felicidade
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
    // Ajusta boca conforme felicidade
    if (gameState.happiness < 30) {
      mouth.setAttribute("d", "M85,100 Q100,90 115,100"); // Sad mouth
    } else if (gameState.happiness > 80) {
      mouth.setAttribute("d", "M80,95 Q100,110 120,95"); // Very happy mouth
    } else {
      mouth.setAttribute("d", "M85,95 Q100,105 115,95"); // Happy mouth
    }
    // Panda em pé: centralizado, pés encostam na grama
    pandaSvg.style.transform = "translateY(60px) scale(1)";
    pandaSvg.style.transformOrigin = "50% 100%";
    pandaSvg.style.transition = "transform 0.7s cubic-bezier(.4,0,.2,1)";
  }
}

// Feed the panda
function feedPanda() {
  if (gameState.sleeping) return;

  playSound("feed");
  gameState.stats.totalFeeds++;
  addExperience(10);

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

  // Incrementar estatísticas de refeição
  gameState.stats.totalFeeds++;
  saveGame();

  if (gameState.stats.totalFeeds === 1) {
    unlockAchievement("firstMeal");
  }
}

// Pet the panda
function petPanda() {
  if (gameState.sleeping) return;

  playSound("pet");
  gameState.stats.totalPets++;
  addExperience(5);

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

  // Incrementar estatísticas de carinho
  gameState.stats.totalPets++;
  saveGame();
}

// Toggle sleep
function toggleSleep() {
  gameState.sleeping = !gameState.sleeping;
  playSound("sleep");
  gameState.stats.totalSleeps++;

  if (gameState.sleeping) {
    document.getElementById("message").textContent =
      "Zzz... Seu panda está dormindo! 😴💤";
    document.getElementById("sleep-btn").innerHTML = "<span>🌞 Acordar</span>";
    updateStats();
  } else {
    document.getElementById("message").textContent = "Seu panda acordou! 🌞✨";
    document.getElementById("sleep-btn").innerHTML = "<span>😴 Dormir</span>";
    // Ativa transição de levantar
    gameState._wakingUp = true;
    updateStats();
  }
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

// Sistema de níveis
function addExperience(amount) {
  gameState.experience += amount;
  while (gameState.experience >= gameState.experienceToNextLevel) {
    gameState.experience -= gameState.experienceToNextLevel;
    gameState.level++;
    gameState.experienceToNextLevel = Math.floor(
      100 * Math.pow(1.2, gameState.level - 1)
    );
    showLevelUpMessage();
  }
  updateLevel();
}

function updateLevel() {
  const levelDisplay = document.querySelector(".level-display");
  if (levelDisplay) {
    levelDisplay.textContent = `Nível ${gameState.level}`;
    const expPercentage =
      (gameState.experience / gameState.experienceToNextLevel) * 100;
    document.getElementById("exp-bar").style.width = `${expPercentage}%`;
    document.getElementById(
      "exp-value"
    ).textContent = `${gameState.experience}/${gameState.experienceToNextLevel} EXP`;
  }
}

function showLevelUpMessage() {
  const message = document.createElement("div");
  message.className = "level-up-message";
  message.textContent = `🎉 Nível ${gameState.level}! 🎉`;
  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 3000);

  // Verificar conquista
  if (gameState.level >= 5) {
    unlockAchievement("reachLevel5");
  }
}

// Sistema de conquistas
function unlockAchievement(achievementId) {
  if (!gameState.achievements[achievementId]) {
    gameState.achievements[achievementId] = true;
    showAchievementMessage(achievementId);
    saveGame();
  }
}

function showAchievementMessage(achievementId) {
  const achievementMessages = {
    firstMeal: "🎯 Primeira Refeição!",
    reachLevel5: "🎯 Nível 5 Alcançado!",
    perfectCare: "🎯 Cuidado Perfeito!",
  };

  const message = document.createElement("div");
  message.className = "achievement-message";
  message.textContent = achievementMessages[achievementId];
  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 3000);
}

// Sistema de sons
const sounds = {
  feed: new Audio("sounds/eat.wav"),
  pet: new Audio("sounds/happy.wav"),
  sleep: new Audio("sounds/sleep.wav"),
};

// Configurar volumes
Object.values(sounds).forEach((sound) => {
  sound.volume = 0.3;
});

function playSound(type) {
  if (sounds[type]) {
    // Se o som já está tocando, pare antes de tocar novamente
    try {
      sounds[type].pause();
      sounds[type].currentTime = 0;
    } catch (e) {}
    sounds[type].play();
  }
}

// Sistema de clima
let currentWeather = "clear";
const weatherTypes = ["clear", "rain", "snow", "sunny"];

function isNight() {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
}

function changeWeather() {
  const weatherContainer = document.getElementById("weather-container");
  weatherContainer.innerHTML = "";

  let allowedWeather;
  if (isNight()) {
    allowedWeather = ["clear", "rain", "snow"];
  } else {
    allowedWeather = ["clear", "sunny"];
  }
  currentWeather =
    allowedWeather[Math.floor(Math.random() * allowedWeather.length)];

  switch (currentWeather) {
    case "rain":
      for (let i = 0; i < 20; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        weatherContainer.appendChild(drop);
      }
      break;
    case "snow":
      for (let i = 0; i < 15; i++) {
        const flake = document.createElement("div");
        flake.className = "snow-flake";
        flake.innerHTML = "❄";
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDelay = `${Math.random() * 3}s`;
        weatherContainer.appendChild(flake);
      }
      break;
    case "sunny":
      for (let i = 0; i < 3; i++) {
        const ray = document.createElement("div");
        ray.className = "sun-ray";
        ray.style.left = `${Math.random() * 80}%`;
        ray.style.top = `${Math.random() * 80}%`;
        ray.style.animationDelay = `${Math.random() * 4}s`;
        weatherContainer.appendChild(ray);
      }
      break;
  }
}

// Initialize game
function initGame() {
  loadGame();
  generateClouds();
  updateStats();
  changeWeather();

  // Mudar o clima periodicamente
  setInterval(changeWeather, 30000);

  // Verificar conquistas periodicamente
  setInterval(checkAchievements, 5000);

  // Auto-save a cada minuto
  setInterval(saveGame, 60000);

  // Load saved game
  loadGame();

  // Add event listeners
  document.getElementById("feed-btn").addEventListener("click", feedPanda);
  document.getElementById("pet-btn").addEventListener("click", petPanda);
  document.getElementById("sleep-btn").addEventListener("click", toggleSleep);

  // Update game state every second
  setInterval(updateGameState, 1000);

  // Initial message
  document.getElementById("message").textContent =
    "Olá! Cuide bem de mim! 🐼💕";
}

function checkAchievements() {
  // Verificar se todos os status estão acima de 80%
  if (
    gameState.hunger > 80 &&
    gameState.happiness > 80 &&
    gameState.energy > 80
  ) {
    unlockAchievement("perfectCare");
  }
}

// Piscar os olhos do panda quando acordado
function startPandaBlinking() {
  if (window._pandaBlinkTimeout) clearTimeout(window._pandaBlinkTimeout);
  // Verifica se os elementos existem antes de tentar piscar
  const eyes = document.getElementById("eyes");
  const closedEyes = document.getElementById("closed-eyes");
  if (!eyes || !closedEyes) return; // Não tenta piscar se não existem
  function blink() {
    if (!gameState.sleeping && !gameState._wakingUp) {
      eyes.style.display = "none";
      closedEyes.style.display = "block";
      setTimeout(() => {
        eyes.style.display = "block";
        closedEyes.style.display = "none";
        // Próximo piscar
        if (!gameState.sleeping && !gameState._wakingUp) {
          window._pandaBlinkTimeout = setTimeout(
            blink,
            1200 + Math.random() * 1000 // Pisca entre 1.2s e 2.2s
          );
        }
      }, 120);
    }
  }
  window._pandaBlinkTimeout = setTimeout(blink, 1200 + Math.random() * 1000);
}

// Stop panda blinking
function stopPandaBlinking() {
  if (window._pandaBlinkTimeout) clearTimeout(window._pandaBlinkTimeout);
}

// Iniciar/pausar piscar conforme estado
const origUpdateStats = updateStats;
updateStats = function () {
  origUpdateStats.apply(this, arguments);
  if (!gameState.sleeping && !gameState._wakingUp) {
    startPandaBlinking();
  } else {
    stopPandaBlinking();
    // Garante olhos fechados ao dormir
    document.getElementById("eyes").style.display = "none";
    document.getElementById("closed-eyes").style.display = "block";
  }
};

// Start the game when page loads
window.addEventListener("load", function () {
  initGame();
  // Garante que o panda pisque ao iniciar, se estiver acordado
  setTimeout(() => {
    // Só inicia o piscar se os elementos existem
    const eyes = document.getElementById("eyes");
    const closedEyes = document.getElementById("closed-eyes");
    if (!gameState.sleeping && !gameState._wakingUp && eyes && closedEyes) {
      startPandaBlinking();
    }
  }, 500);
});
