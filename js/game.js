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

  // Novas flags para controle de ações específicas
  _isEating: false,
  _isBeingPet: false,
};

// Global timer for blinking
let _pandaBlinkTimer = null;

// Sistema de salvamento
function saveGame() {
  localStorage.setItem("pandaPetSave", JSON.stringify(gameState));
}

function loadGame() {
  const savedGame = localStorage.getItem("pandaPetSave");
  if (savedGame) {
    Object.assign(gameState, JSON.parse(savedGame));
    updateStats();
    // Reset action flags on load in case they were true when saving
    // This prevents the game from loading into a stuck state
    gameState._isEating = false;
    gameState._isBeingPet = false;
    gameState._wakingUp = false; // Also reset waking up flag
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

// Atualiza a aparência do panda pixel art
function updatePandaPixelArt() {
  console.log(
    "updatePandaPixelArt called. Sleeping:",
    gameState.sleeping,
    "Waking up:",
    gameState._wakingUp,
    "Eating:",
    gameState._isEating,
    "Being Pet:",
    gameState._isBeingPet
  );
  const awake = document.getElementById("panda-awake");
  const sit = document.getElementById("panda-sit");
  const blink = document.getElementById("panda-blink");
  const awakeBlink = document.getElementById("panda-awake-blink"); // Nova imagem
  const sleep = document.getElementById("panda-sleep");
  const sad = document.getElementById("panda-sad"); // Nova imagem triste

  // Verifica se todos os elementos de imagem do panda existem
  if (!awake || !sit || !blink || !sleep || !awakeBlink || !sad) {
    console.error(
      "Um ou mais elementos de imagem do panda não foram encontrados!"
    );
    return;
  }

  // Esconder todos primeiro para simplificar a lógica
  awake.style.display = "none";
  sit.style.display = "none";
  blink.style.display = "none";
  awakeBlink.style.display = "none"; // Esconder a nova imagem
  sleep.style.display = "none";
  sad.style.display = "none"; // Esconder a imagem triste

  if (gameState.sleeping) {
    // Prioridade máxima: dormindo
    sleep.style.display = "block";
    console.log("Panda display: sleep");
  } else if (gameState._isEating) {
    // Panda senta para comer
    sit.style.display = "block";
    console.log("Panda display: sit (eating)");
  } else if (gameState._isBeingPet) {
    // Panda senta com olhos fechados ao receber carinho
    blink.style.display = "block";
    console.log("Panda display: blink (being pet)");
  } else if (
    gameState.hunger <= 50 ||
    gameState.happiness <= 50 ||
    gameState.energy <= 50
  ) {
    // Panda está triste se alguma necessidade estiver baixa e não estiver em outra ação prioritária
    sad.style.display = "block";
    console.log("Panda display: sad");
  } else {
    // Estado padrão ou acordando: panda em pé
    awake.style.display = "block";
    console.log("Panda display: awake (default/waking)");
  }
}

// --- Blinking Logic ---
function stopBlinking() {
  if (_pandaBlinkTimer) {
    clearTimeout(_pandaBlinkTimer);
    _pandaBlinkTimer = null;
  }

  const awakeImg = document.getElementById("panda-awake");
  const sitImg = document.getElementById("panda-sit");
  const blinkImg = document.getElementById("panda-blink");
  const awakeBlinkImg = document.getElementById("panda-awake-blink"); // Em pé piscando
  // Verifica se as imagens necessárias para parar a piscada existem
  if (!awakeImg || !sitImg || !blinkImg || !awakeBlinkImg) {
    console.error("Missing one or more panda image elements!");
    return;
  }

  // If blinking is stopped:
  // 1. Hide the animated blink image (panda-blink OR panda-awake-blink),
  //    UNLESS it's the static "pet" pose (gameState._isBeingPet uses panda-blink).
  // 2. Ensure the correct base image (panda-sit if eating, panda-awake if standing)
  //    is visible if it was hidden by the animation.
  // Note: updatePandaPixelArt() is responsible for the primary visibility of awake, sit (when not eating), sleep, and blink (when being pet).
  // This stopBlinking logic is specifically for cleaning up the *animated* blink state.

  // Hide sitting blink image if it was for animation (not petting)
  if (!gameState._isBeingPet && blinkImg.style.display === "block") {
    console.log("stopBlinking: Hiding animated panda-blink");
    blinkImg.style.display = "none";
    // If it was blinking while eating, ensure panda-sit is visible
    if (gameState._isEating && sitImg.style.display === "none") {
      console.log("stopBlinking: Restoring panda-sit after eating blink");
      sitImg.style.display = "block";
    }
    // If it was blinking while standing (which shouldn't happen with current logic, but as a safeguard), ensure awake is visible
  }
  // Hide standing blink image if it was visible
  if (awakeBlinkImg.style.display === "block") {
    awakeBlinkImg.style.display = "none";
    // If it was blinking while standing, ensure panda-awake is visible
    if (
      !gameState._isEating &&
      !gameState._isBeingPet &&
      !gameState.sleeping &&
      !gameState._wakingUp &&
      awakeImg.style.display === "none"
    ) {
      awakeImg.style.display = "block";
      console.log("stopBlinking: Restoring panda-awake after standing blink");
    }
  }
  // If gameState._isBeingPet is true, updatePandaPixelArt handles blinkImg visibility.
  // If gameState.sleeping or _wakingUp, updatePandaPixelArt handles those images.
}

function startBlinking() {
  // Pre-conditions for natural blinking:
  // Must be eating (so panda-sit is the base, compatible with panda-blink).
  // OR must be standing (default state).
  // Must NOT be sleeping, waking up, being petted, or sad.
  const isSad =
    gameState.hunger <= 50 ||
    gameState.happiness <= 50 ||
    gameState.energy <= 50;

  if (
    gameState.sleeping ||
    gameState._wakingUp ||
    gameState._isBeingPet ||
    isSad
  ) {
    stopBlinking(); // Ensure any prior blinking is stopped if state is not suitable.
    return;
  }
  if (_pandaBlinkTimer !== null) return; // Already blinking.

  const awakeImg = document.getElementById("panda-awake");
  const sitImg = document.getElementById("panda-sit");
  const blinkImg = document.getElementById("panda-blink"); // Sentado piscando
  const awakeBlinkImg = document.getElementById("panda-awake-blink"); // Em pé piscando

  // Verifica se as imagens necessárias para a animação de piscar existem
  if (!awakeImg || !sitImg || !blinkImg || !awakeBlinkImg) {
    console.error("Missing one or more panda image elements for blinking!");
    return;
  }

  function blinkAnim() {
    // Re-check conditions at the start of each animation step.
    const isSadNow =
      gameState.hunger <= 50 ||
      gameState.happiness <= 50 ||
      gameState.energy <= 50;
    if (
      gameState.sleeping ||
      gameState._wakingUp ||
      gameState._isBeingPet ||
      isSadNow
    ) {
      stopBlinking(); // State changed, stop blinking. stopBlinking handles visual cleanup.
      return;
    }

    let baseImageToHide, blinkImageToShow;

    if (gameState._isEating) {
      // Panda is eating
      console.log("startBlinking: Blinking while eating (sit)");
      baseImageToHide = sitImg;
      blinkImageToShow = blinkImg;
    } else {
      // Panda is standing (default state)
      baseImageToHide = awakeImg;
      console.log("startBlinking: Blinking while standing (awake)");
      blinkImageToShow = awakeBlinkImg;
    }

    baseImageToHide.style.display = "none";
    blinkImageToShow.style.display = "block";

    _pandaBlinkTimer = setTimeout(() => {
      // Before reverting, check conditions again.
      const isSadAfterBlink =
        gameState.hunger <= 50 ||
        gameState.happiness <= 50 ||
        gameState.energy <= 50;
      if (
        gameState.sleeping ||
        gameState._wakingUp ||
        gameState._isBeingPet ||
        isSadAfterBlink
      ) {
        stopBlinking(); // State changed during the 120ms blink, or became sad.
        return;
      }

      blinkImageToShow.style.display = "none";
      // Re-evaluate which base image should be shown *now* in case state changed
      let baseImageToShowAfterBlink = gameState._isEating ? sitImg : awakeImg;

      // Ensure the *correct* base image is shown, and the *other* base image is hidden.
      // This handles transitions that might happen during the blink duration.
      if (
        baseImageToShowAfterBlink === sitImg &&
        awakeImg.style.display === "block"
      )
        awakeImg.style.display = "none";
      if (
        baseImageToShowAfterBlink === awakeImg &&
        sitImg.style.display === "block"
      )
        sitImg.style.display = "none";
      baseImageToShowAfterBlink.style.display = "block";

      const nextBlinkDelay = 1200 + Math.random() * 1500; // Random delay for next blink
      _pandaBlinkTimer = setTimeout(blinkAnim, nextBlinkDelay);
    }, 120); // Blink duration (eyes closed)
  }

  const initialBlinkDelay = 300 + Math.random() * 400; // Initial random delay (0.3s to 0.7s)
  _pandaBlinkTimer = setTimeout(blinkAnim, initialBlinkDelay);
}

function updatePandaAppearance() {
  updatePandaPixelArt();

  // Manage blinking animation.
  // Panda blinks naturally if not sleeping, waking up, or being petted.
  // This covers both standing (default) and eating states.
  if (!gameState.sleeping && !gameState._wakingUp && !gameState._isBeingPet) {
    startBlinking();
  } else {
    // Conditions not met for animated blinking.
    stopBlinking();
  }
}

// Feed the panda
function feedPanda() {
  if (
    gameState.sleeping ||
    gameState._wakingUp ||
    gameState._isEating ||
    gameState._isBeingPet
  )
    return;
  playSound("feed");
  gameState.stats.totalFeeds++;
  addExperience(10);

  gameState._isEating = true;
  updatePandaPixelArt(); // Panda senta para comer
  document.getElementById("message").textContent =
    "Seu panda está comendo... 🎋";

  // Efeito visual: bambu
  const pandaContainer = document.getElementById("panda-container");
  const bamboo = document.createElement("div");
  bamboo.className = "bamboo";
  bamboo.style.position = "absolute";
  bamboo.style.top = "50%";
  bamboo.style.left = "50%";
  bamboo.style.transform = "translate(-50%, -50%)";
  bamboo.style.zIndex = "10";
  const leaf = document.createElement("div");
  leaf.className = "bamboo-leaf";
  bamboo.appendChild(leaf);
  pandaContainer.appendChild(bamboo);
  setTimeout(() => {
    bamboo.style.transform = "translate(-50%, -50%) scale(0.8)";
    bamboo.style.opacity = "0";
    gameState.hunger = Math.min(100, gameState.hunger + 20);
    try {
      gameState._isEating = false; // Reseta a flag
      updateStats(); // Atualiza barras, imagem (para em pé) e mensagem padrão
      document.getElementById("message").textContent =
        "Nyam nyam! Delicioso! 🎋😋"; // Mensagem específica pós-comer
    } catch (error) {
      console.error("Error in feed timeout callback:", error); // Log de erro
      gameState._isEating = false; // Ensure flag is reset even on error
    } finally {
      setTimeout(() => {
        bamboo.remove();
      }, 500);
    }
  }, 1500); // Duração da animação de comer
  saveGame();

  if (gameState.stats.totalFeeds === 1) {
    unlockAchievement("firstMeal");
  }
}

// Pet the panda
function petPanda() {
  if (
    gameState.sleeping ||
    gameState._wakingUp ||
    gameState._isEating ||
    gameState._isBeingPet
  )
    return;
  playSound("pet");
  gameState.stats.totalPets++;
  addExperience(5);
  const pandaContainer = document.getElementById("panda-container");

  gameState._isBeingPet = true;
  updatePandaPixelArt(); // Panda senta com olhos fechados (panda-blink)
  document.getElementById("message").textContent =
    "Seu panda está amando o carinho... 🥰";

  // Efeitos visuais de coração e brilho
  for (let i = 0; i < 5; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = ["❤", "💕", "💖", "💗"][Math.floor(Math.random() * 4)];
    heart.style.left = `${Math.random() * 80 + 10}%`;
    heart.style.top = `${Math.random() * 50}%`;
    heart.style.animationDelay = `${i * 0.15}s`;
    pandaContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      createSparkle(Math.random() * 200 + 25, Math.random() * 150 + 25);
    }, i * 150);
  }

  // Atualiza o estado lógico da felicidade
  gameState.happiness = Math.min(100, gameState.happiness + 15);

  setTimeout(() => {
    console.log("Pet timeout callback running."); // Log para depuração
    try {
      gameState._isBeingPet = false; // Reseta a flag antes de atualizar
      updateStats(); // Atualiza barras, imagem (para em pé) e mensagem padrão
      document.getElementById("message").textContent =
        "Seu panda adora carinho! 🥰💕"; // Mensagem específica pós-carinho
    } catch (error) {
      console.error("Error in pet timeout callback:", error); // Log de erro
    }
  }, 1200); // Duração do estado de "recebendo carinho"
  saveGame();
}

// Toggle sleep
function toggleSleep() {
  // Se estiver acordando, comendo ou recebendo carinho, não permite dormir/acordar imediatamente
  // Exceto se já estiver dormindo e uma dessas flags (_isEating/_isBeingPet) estiverem ativas por algum bug, permite acordar.
  if (
    gameState._wakingUp ||
    ((gameState._isEating || gameState._isBeingPet) && !gameState.sleeping)
  ) {
    return;
  }

  gameState.sleeping = !gameState.sleeping;
  playSound("sleep");
  gameState.stats.totalSleeps++;
  if (gameState.sleeping) {
    gameState._isEating = false; // Garante que para de comer ao dormir
    gameState._isBeingPet = false; // Garante que para de receber carinho ao dormir
    document.getElementById("message").textContent =
      "Zzz... Seu panda está dormindo! 😴💤";
    document.getElementById("sleep-btn").innerHTML = "<span>🌞 Acordar</span>";
    updateStats();
  } else {
    document.getElementById("message").textContent = "Seu panda acordou! 🌞✨";
    document.getElementById("sleep-btn").innerHTML = "<span>😴 Dormir</span>";
    gameState._wakingUp = true;
    updatePandaPixelArt(); // Mostra o panda em pé (awake) imediatamente
    // Pequeno delay para a flag _wakingUp e para reavaliar mensagens
    setTimeout(() => {
      console.log("Waking up timeout callback running."); // Log para depuração
      gameState._wakingUp = false;
      updateStats(); // Atualiza barras e mensagens
    }, 500);
  }
}

// Update game state over time
function updateGameState() {
  if (gameState.sleeping) {
    gameState.energy = Math.min(100, gameState.energy + 1);
    gameState.lastUpdate = Date.now(); // Corrige bug da barra
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
    try {
      // Removido pause() para evitar AbortError
      sounds[type].currentTime = 0;
    } catch (e) {}
    sounds[type].play().catch(() => {}); // Silencia AbortError
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

  // Add event listeners
  document.getElementById("feed-btn").addEventListener("click", feedPanda);
  document.getElementById("pet-btn").addEventListener("click", petPanda);
  document.getElementById("sleep-btn").addEventListener("click", toggleSleep);

  // Update game state every second
  setInterval(updateGameState, 1000);

  // Remover listeners .onclick duplicados mais abaixo

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

// Start the game when page loads
window.addEventListener("load", function () {
  initGame();
  // initGame calls updateStats, which calls updatePandaAppearance, which will handle initial blinking state.
});

// Os event listeners .onclick foram removidos para evitar duplicação,
// pois já são adicionados com addEventListener em initGame().
