// Game state
const gameState = {
  // Stats básicos
  hunger: 100,
  happiness: 100,
  energy: 100,
  sleeping: false,
  lastUpdate: Date.now(),

  // Sistema de níveis (disabled)
  level: 1, // kept for compatibility
  experience: 0, // kept for compatibility
  experienceToNextLevel: 100, // kept for compatibility

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

  // Flag para controlar o estado da animação de chuva
  _isInRainAnimation: false,
};

// Global timer for blinking
let _pandaBlinkTimer = null;

// Timer para animação dos olhos na chuva
let _pandaRainEyesTimer = null;

// Sistema de salvamento
function saveGame() {
  localStorage.setItem("pandaPetSave", JSON.stringify(gameState));
}

function loadGame() {
  const savedGame = localStorage.getItem("pandaPetSave");
  if (savedGame) {
    Object.assign(gameState, JSON.parse(savedGame));
    // Reset lastUpdate para o momento atual para evitar queda abrupta de status
    gameState.lastUpdate = Date.now();

    updateStats();
    // Reset action flags on load in case they were true when saving
    // This prevents the game from loading into a stuck state
    gameState._isEating = false;
    gameState._isBeingPet = false;
    gameState._wakingUp = false; // Also reset waking up flag
    gameState._isInRainAnimation = false; // Reset animation state
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
  // Add sun depending on time (moon and night-mode removed)
  const sunId = "panda-sun";
  let sun = document.getElementById(sunId);
  if (!sun) {
    sun = document.createElement("div");
    sun.id = sunId;
    sun.className = "sun";
    cloudsContainer.insertBefore(sun, cloudsContainer.firstChild);
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

  // Corrige bug: força a largura da barra de energia SEM usar !important
  const energyBar = document.getElementById("energy-bar");
  if (energyBar) {
    // Força reflow para garantir atualização visual imediata
    energyBar.style.display = "none";
    // eslint-disable-next-line no-unused-expressions
    energyBar.offsetHeight; // trigger reflow
    energyBar.style.display = "block";
    energyBar.style.width = gameState.energy + "%";
  }
  document.getElementById("energy-value").textContent = `${Math.round(
    gameState.energy
  )}%`;

  // Atualiza mensagem e aparência
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

// Atualiza a aparência do panda pixel art
function updatePandaPixelArt() {
  // Sempre esconde todas as imagens do panda antes de mostrar a correta
  const pandaImgs = [
    "panda-awake",
    "panda-awake-blink",
    "panda-sit",
    "panda-blink",
    "panda-sleep",
    "panda-sad",
    "panda-rain",
    "panda-rain-eye-center",
    "panda-rain-eye-up",
  ];
  pandaImgs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "none";
      el.classList.remove("panda-breathing");
    }
  });
  // Seleciona elementos novamente para garantir referência correta
  const awake = document.getElementById("panda-awake");
  const sit = document.getElementById("panda-sit");
  const blink = document.getElementById("panda-blink");
  const awakeBlink = document.getElementById("panda-awake-blink");
  const sleep = document.getElementById("panda-sleep");
  const sad = document.getElementById("panda-sad");
  const rain = document.getElementById("panda-rain");
  const rainEyeCenter = document.getElementById("panda-rain-eye-center");
  const rainEyeUp = document.getElementById("panda-rain-eye-up");

  // Prioridade máxima: dormindo
  if (gameState.sleeping) {
    sleep.style.display = "block";
    return;
  }
  // Prioridade: carinho (panda piscando sentado OU panda da chuva recebendo carinho)
  if (gameState._isBeingPet) {
    if (gameState._isInRainAnimation) {
      stopRainEyesAnimation();
      gameState._isInRainAnimation = false;
    }
    stopBlinking();
    // Sempre mostra o panda-blink ao fazer carinho, mesmo na chuva
    [
      awake,
      sit,
      awakeBlink,
      rain,
      rainEyeCenter,
      rainEyeUp,
      sad,
      sleep,
    ].forEach((img) => {
      if (img) {
        img.style.display = "none";
        img.classList.remove("panda-breathing");
      }
    });
    if (blink) {
      blink.style.display = "block";
      blink.classList.add("panda-breathing");
      blink.style.opacity = "";
      blink.style.transition = "";
      // Set a lower z-index to ensure it doesn't appear above rain eyes
      blink.style.zIndex = "5";
      blink.style.pointerEvents = "";
      blink.style.position = "";
      blink.style.left = "";
      blink.style.right = "";
      blink.style.margin = "";
      blink.style.bottom = "";
      blink.style.top = "";
      if (blink.src && !blink.src.includes("panda-blink.png")) {
        blink.src = "gifs/panda-blink.png";
      }
    }
    return;
  }

  // Prioridade: chuva (se não está em carinho)
  if (
    typeof currentWeather !== "undefined" &&
    currentWeather === "rain" &&
    !gameState._isEating &&
    !gameState.sleeping
  ) {
    stopBlinking();
    // Exibe a base do panda da chuva SEMPRE
    if (rain) {
      rain.style.display = "block";
      rain.style.opacity = "1";
      rain.style.transition = "none";
      rain.classList.add("panda-breathing");
    }
    // Esconde olhos alternativos inicialmente
    [rainEyeCenter, rainEyeUp].forEach((img) => {
      if (img) {
        img.style.display = "none";
        img.style.opacity = "1";
        img.style.transition = "none";
      }
    });
    if (!gameState._isInRainAnimation) {
      gameState._isInRainAnimation = true;
      setTimeout(() => {
        if (
          gameState._isInRainAnimation &&
          currentWeather === "rain" &&
          !gameState._isBeingPet &&
          !gameState._isEating &&
          !gameState.sleeping
        ) {
          startRainEyesAnimation();
        }
      }, 200);
    }
    return;
  } else if (gameState._isInRainAnimation && currentWeather !== "rain") {
    gameState._isInRainAnimation = false;
    stopRainEyesAnimation();
  }

  // Prioridade: comendo (sentado)
  if (gameState._isEating) {
    sit.style.display = "block";
    sit.classList.add("panda-breathing");
    return;
  }
  // Prioridade: triste
  if (
    gameState.hunger <= 50 ||
    gameState.happiness <= 50 ||
    gameState.energy <= 50
  ) {
    sad.style.display = "block";
    sad.classList.add("panda-breathing");
    return;
  }
  // Estado padrão: acordado em pé
  awake.style.display = "block";
  awake.classList.add("panda-breathing");
}

// --- Blinking Logic ---
function stopBlinking() {
  if (_pandaBlinkTimer) {
    clearTimeout(_pandaBlinkTimer);
    _pandaBlinkTimer = null;
  }

  // ATENÇÃO: As referências a 'blinkImg' (panda-blink) foram removidas daqui.
  const awakeBlinkImg = document.getElementById("panda-awake-blink");

  // Agora, esta função só esconde a imagem da "piscada natural" (em pé).
  // A imagem 'panda-blink' (usada para o carinho) será controlada apenas
  // pela lógica dentro de updatePandaPixelArt, que é o correto.
  if (awakeBlinkImg) {
    awakeBlinkImg.style.display = "none";
  }
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
      stopBlinking();
      return;
    }

    let baseImageToHide, blinkImageToShow;

    if (gameState._isEating) {
      baseImageToHide = sitImg;
      blinkImageToShow = blinkImg;
    } else {
      baseImageToHide = awakeImg;
      blinkImageToShow = awakeBlinkImg;
    }

    // Antes de mostrar a imagem de piscar, esconde todas as imagens do panda
    [awakeImg, sitImg, blinkImg, awakeBlinkImg].forEach((img) => {
      if (img !== blinkImageToShow) img.style.display = "none";
    });
    blinkImageToShow.style.display = "block";

    _pandaBlinkTimer = setTimeout(() => {
      // Antes de reverter, checa condições novamente
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
        stopBlinking();
        return;
      }
      blinkImageToShow.style.display = "none";
      baseImageToHide.style.display = "block";
      // MANTÉM O OLHO ABERTO POR MAIS TEMPO
      const nextBlinkDelay = 1800 + Math.random() * 1200; // 1.8s a 3s
      _pandaBlinkTimer = setTimeout(blinkAnim, nextBlinkDelay);
    }, 120); // Tempo do olho fechado (piscar)
  }

  const initialBlinkDelay = 300 + Math.random() * 400;
  _pandaBlinkTimer = setTimeout(blinkAnim, initialBlinkDelay);
}

function updatePandaAppearance() {
  // Interrompe a animação dos olhos na chuva se o clima não for mais chuva
  // ou se o panda estiver dormindo ou em outro estado incompatível
  if (
    currentWeather !== "rain" ||
    gameState.sleeping ||
    gameState._isBeingPet ||
    gameState._isEating
  ) {
    if (gameState._isInRainAnimation) {
      stopRainEyesAnimation();
    }
  }

  updatePandaPixelArt();

  // Gerencia a animação de piscar
  // Importante: só piscamos normalmente se NÃO estiver em animação de chuva
  // e se não estiver dormindo, acordando ou sendo acariciado
  if (
    !gameState._isInRainAnimation &&
    !gameState.sleeping &&
    !gameState._wakingUp &&
    !gameState._isBeingPet
  ) {
    startBlinking();
  } else {
    // Condições não atendidas para piscar normalmente
    stopBlinking();
  }
}

// Função para controlar a animação dos olhos do panda na chuva
function stopRainEyesAnimation() {
  if (_pandaRainEyesTimer) {
    clearTimeout(_pandaRainEyesTimer);
    _pandaRainEyesTimer = null;
  }
  // Apenas esconde as camadas dos olhos, mas mantém a base do panda da chuva visível se for chuva
  const rainImg = document.getElementById("panda-rain");
  const rainEyeCenterImg = document.getElementById("panda-rain-eye-center");
  const rainEyeUpImg = document.getElementById("panda-rain-eye-up");
  if (rainEyeCenterImg) {
    rainEyeCenterImg.style.display = "none";
    rainEyeCenterImg.classList.remove("panda-breathing");
  }
  if (rainEyeUpImg) {
    rainEyeUpImg.style.display = "none";
    rainEyeUpImg.classList.remove("panda-breathing");
  }
  // Só esconde a base se não for mais chuva
  if (currentWeather !== "rain" && rainImg) {
    rainImg.style.display = "none";
    rainImg.classList.remove("panda-breathing");
  }
  gameState._isInRainAnimation = false;
}

function startRainEyesAnimation() {
  if (_pandaRainEyesTimer !== null) {
    stopRainEyesAnimation();
  }
  stopBlinking();

  const rainBase = document.getElementById("panda-rain"); // base sempre visível
  const rainCenter = document.getElementById("panda-rain-eye-center"); // olhos abertos
  const rainUp = document.getElementById("panda-rain-eye-up"); // olhando pra cima
  const blinkImg = document.getElementById("panda-blink"); // Garantir que não aparece por cima dos olhos da chuva

  if (blinkImg) {
    blinkImg.style.display = "none";
    blinkImg.classList.remove("panda-breathing");
  }

  if (!rainBase || !rainCenter || !rainUp) {
    console.error("Faltam imagens do panda na chuva para animação");
    if (rainCenter) {
      rainCenter.style.display = "block";
      rainCenter.classList.add("panda-breathing");
      rainCenter.style.opacity = "1";
    }
    return;
  }
  // A base da chuva SEMPRE fica visível e estática
  rainBase.style.display = "block";
  rainBase.style.opacity = "1";
  rainBase.style.transition = "none";
  rainBase.classList.add("panda-breathing");
  rainBase.style.zIndex = "4";

  // Inicializa as camadas dos olhos invisíveis
  [rainCenter, rainUp].forEach((img) => {
    img.style.transition = "opacity 0.8s ease-in-out";
    img.style.opacity = "0";
    img.style.display = "none";
    img.classList.remove("panda-breathing");
    img.style.zIndex = "6"; // Ensure rain eyes are always above blink
    img.style.position = "absolute";
    img.style.bottom = "0";
    img.style.left = "0";
    img.style.right = "0";
    img.style.margin = "0 auto";
  });

  // Mostra o padrão (olhos abertos) por cima da base
  rainCenter.style.display = "block";
  rainCenter.style.opacity = "1";
  rainCenter.classList.add("panda-breathing");
  let blinkCount = 0;
  let upNext = false;

  // Ensure panda-blink is never visible during rain animation
  const blinkElement = document.getElementById("panda-blink");
  if (blinkElement) {
    blinkElement.style.display = "none";
    blinkElement.classList.remove("panda-breathing");
  }

  function rainEyesLoop() {
    if (
      !gameState._isInRainAnimation ||
      gameState.sleeping ||
      gameState._isBeingPet ||
      gameState._isEating
    ) {
      stopRainEyesAnimation();
      updatePandaPixelArt();
      return;
    }

    // Decide se vai olhar pra cima ou piscar
    if (upNext) {
      // Olhar pra cima
      rainCenter.style.opacity = "0";
      rainUp.style.display = "block";
      setTimeout(() => {
        rainUp.style.opacity = "1";
        rainUp.classList.add("panda-breathing");
        setTimeout(() => {
          rainUp.style.opacity = "0";
          rainUp.classList.remove("panda-breathing");
          setTimeout(() => {
            rainUp.style.display = "none";
            rainCenter.style.display = "block";
            rainCenter.style.opacity = "1";
            rainCenter.classList.add("panda-breathing");
            upNext = false;
            _pandaRainEyesTimer = setTimeout(
              rainEyesLoop,
              7000 + Math.random() * 3000
            );
          }, 800);
        }, 1000); // Olhar pra cima por 1s
      }, 100);
    } else {
      // Piscar
      rainCenter.style.opacity = "0";
      // Para piscar, só sobrepõe a camada dos olhos fechados (panda-rain-eye-center pode ser usada para "fechar" se não houver uma específica)
      // Aqui, para manter compatibilidade, só "apaga" os olhos abertos e volta
      setTimeout(() => {
        rainCenter.style.opacity = "1";
        rainCenter.classList.add("panda-breathing");
        blinkCount++;
        // A cada 2-3 ciclos, faz olhar pra cima
        if (blinkCount >= 2 + Math.floor(Math.random() * 2)) {
          blinkCount = 0;
          upNext = true;
        }
        _pandaRainEyesTimer = setTimeout(
          rainEyesLoop,
          7000 + Math.random() * 3000
        );
      }, 120); // Piscar rápido (olhos "fechados" por 120ms)
    }
  }

  gameState._isInRainAnimation = true;
  _pandaRainEyesTimer = setTimeout(rainEyesLoop, 2000 + Math.random() * 2000); // Primeiro ciclo mais rápido
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
  // Removido addExperience (não usado)

  gameState._isEating = true;
  updatePandaPixelArt();
  document.getElementById("message").textContent =
    "Seu panda está comendo... 🎋";

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
    gameState._isEating = false;
    updateStats();
    document.getElementById("message").textContent =
      "Nyam nyam! Delicioso! 🎋😋";
    setTimeout(() => bamboo.remove(), 500);
  }, 1500);
  saveGame();
  if (gameState.stats.totalFeeds === 1) unlockAchievement("firstMeal");
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

  // Log para depuração
  console.log("Botão de carinho clicado!");

  playSound("pet");
  gameState.stats.totalPets++;

  gameState._isBeingPet = true;
  stopBlinking();
  if (gameState._isInRainAnimation) {
    stopRainEyesAnimation();
    gameState._isInRainAnimation = false;
  }
  updatePandaPixelArt();
  document.getElementById("message").textContent =
    "Seu panda está amando o carinho... 🥰";
  const pandaContainer = document.getElementById("panda-container");
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
  gameState.happiness = Math.min(100, gameState.happiness + 15);
  gameState.lastUpdate = Date.now();
  updateStats(); // Verificar se estava chovendo antes do carinho
  const wasRainingBeforePet = currentWeather === "rain";

  setTimeout(() => {
    gameState._isBeingPet = false;

    // Se estava chovendo antes, restaura a animação da chuva
    if (wasRainingBeforePet && currentWeather === "rain") {
      updatePandaPixelArt();
      // Inicia a animação da chuva com um pequeno atraso para garantir que a transição seja suave
      setTimeout(() => {
        if (
          currentWeather === "rain" &&
          !gameState.sleeping &&
          !gameState._isBeingPet &&
          !gameState._isEating
        ) {
          startRainEyesAnimation();
        }
      }, 200);
    } else {
      updatePandaPixelArt();
    }

    document.getElementById("message").textContent =
      "Seu panda adora carinho! 🥰💕";
  }, 1200);
  saveGame();
}

// Toggle sleep
function toggleSleep() {
  if (
    gameState._wakingUp ||
    ((gameState._isEating || gameState._isBeingPet) && !gameState.sleeping)
  )
    return;
  stopRainEyesAnimation();
  gameState.sleeping = !gameState.sleeping;
  playSound("sleep");
  gameState.stats.totalSleeps++;
  if (gameState.sleeping) {
    gameState._isEating = false;
    gameState._isBeingPet = false;
    document.getElementById("message").textContent =
      "Zzz... Seu panda está dormindo! 😴💤";
    document.getElementById("sleep-btn").innerHTML = "<span>🌞 Acordar</span>";
    updateStats();
  } else {
    document.getElementById("message").textContent = "Seu panda acordou! 🌞✨";
    document.getElementById("sleep-btn").innerHTML = "<span>😴 Dormir</span>";
    gameState._wakingUp = true;
    updatePandaPixelArt();
    setTimeout(() => {
      gameState._wakingUp = false;
      updateStats();
    }, 500);
  }
}

// Update game state over time
function updateGameState() {
  const now = Date.now();
  if (gameState.sleeping) {
    const elapsed = (now - gameState.lastUpdate) / 1000; // segundos
    gameState.energy = Math.min(100, gameState.energy + elapsed * 10); // 10 pontos por segundo (rápido)
    gameState.lastUpdate = now;
  } else {
    const elapsed = (now - gameState.lastUpdate) / 1000; // seconds
    gameState.hunger = Math.max(0, gameState.hunger - elapsed * 0.2);
    gameState.happiness = Math.max(0, gameState.happiness - elapsed * 0.15);
    gameState.energy = Math.max(0, gameState.energy - elapsed * 0.1);
    gameState.lastUpdate = now;
  }
  updateStats();
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
      // Para o som anterior antes de tocar novamente
      sounds[type].pause();
      sounds[type].currentTime = 0;
    } catch (e) {}
    sounds[type].play().catch(() => {}); // Silencia AbortError
  }
}

// Sistema de clima
let currentWeather = "clear"; // Estado inicial do clima
const weatherTypes = ["clear", "rain", "snow", "sunny"];

// Função para verificar se as imagens do clima estão carregadas
function checkWeatherImages() {
  const rainImg = document.getElementById("panda-rain");
  if (rainImg && rainImg.complete === false) {
    // Se a imagem ainda não foi carregada, adiciona um evento de carga
    rainImg.onload = function () {
      console.log("Imagem panda-rain carregada com sucesso!");
    };
    rainImg.onerror = function () {
      console.error("Erro ao carregar a imagem panda-rain!");
    };
  }
}

function isNight() {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
}

function changeWeather() {
  const weatherContainer = document.getElementById("weather-container");
  weatherContainer.innerHTML = "";

  // Salvar clima anterior para comparação
  const previousWeather = currentWeather;

  const now = new Date();
  const hour = now.getHours();

  // Debug temporário para mostrar a hora atual
  console.log("Hora atual:", hour, "Hora ímpar:", hour % 2 === 1);

  // Se for hora ímpar, sempre chove
  if (hour % 2 === 1) {
    currentWeather = "rain";
  } else {
    let allowedWeather;
    if (isNight()) {
      // Removido "rain" das opções para horas pares à noite
      allowedWeather = ["clear", "snow"];
    } else {
      allowedWeather = ["clear", "sunny"];
    }
    currentWeather =
      allowedWeather[Math.floor(Math.random() * allowedWeather.length)];
  }

  // Debug temporário para mostrar o clima selecionado
  console.log("Clima selecionado:", currentWeather);

  switch (currentWeather) {
    case "rain":
      for (let i = 0; i < 20; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        weatherContainer.appendChild(drop);
      }

      // Se já tiver uma animação de chuva em andamento, não interrompemos
      // Isso evita que o panda fique desaparecendo quando o clima é atualizado
      if (!gameState._isInRainAnimation) {
        // Primeiro encontramos qual panda está visível atualmente
        const currentVisiblePanda = document.querySelector(
          "#panda-container img[style*='display: block']"
        );
        const rainImg = document.getElementById("panda-rain");

        // Se temos um panda visível e não é o da chuva, fazemos uma transição suave
        if (
          currentVisiblePanda &&
          currentVisiblePanda.id !== "panda-rain" &&
          !gameState.sleeping &&
          !gameState._isBeingPet &&
          !gameState._isEating
        ) {
          // Preparamos o panda da chuva com opacidade zero mas visível
          rainImg.style.transition = "opacity 0.8s ease-in-out";
          rainImg.style.opacity = "0";
          rainImg.style.display = "block";
          rainImg.classList.add("panda-breathing");

          // Fade out do panda atual
          currentVisiblePanda.style.transition = "opacity 0.6s ease-out";
          currentVisiblePanda.style.opacity = "0";

          // Fade in do panda da chuva
          setTimeout(() => {
            rainImg.style.opacity = "1";

            // Escondemos o panda anterior após a transição
            setTimeout(() => {
              if (currentWeather === "rain") {
                currentVisiblePanda.style.display = "none";
                currentVisiblePanda.classList.remove("panda-breathing");

                // Configura a animação da chuva após a transição estar completa
                gameState._isInRainAnimation = true;
                setTimeout(() => {
                  // Verifica novamente o estado
                  if (
                    currentWeather === "rain" &&
                    !gameState.sleeping &&
                    !gameState._isBeingPet &&
                    !gameState._isEating
                  ) {
                    startRainEyesAnimation();
                  }
                }, 300);
              }
            }, 600);
          }, 100);
        } else {
          // Se não há um panda visível ou já estamos mostrando o da chuva,
          // simplesmente atualizamos sem transição especial
          setTimeout(() => {
            if (
              currentWeather === "rain" &&
              !gameState.sleeping &&
              !gameState._isBeingPet &&
              !gameState._isEating
            ) {
              updatePandaPixelArt();
            }
          }, 300);
        }
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
      // Se estava chovendo antes, precisamos atualizar o panda
      if (previousWeather === "rain") {
        stopRainEyesAnimation();
        gameState._isInRainAnimation = false;
        setTimeout(() => {
          updatePandaPixelArt();
        }, 100);
      }
      break;
    case "sunny":
    case "clear":
      if (currentWeather === "sunny") {
        for (let i = 0; i < 3; i++) {
          const ray = document.createElement("div");
          ray.className = "sun-ray";
          ray.style.left = `${Math.random() * 80}%`;
          ray.style.top = `${Math.random() * 80}%`;
          ray.style.animationDelay = `${Math.random() * 4}s`;
          weatherContainer.appendChild(ray);
        }
      }
      // Se estava chovendo antes, precisamos atualizar o panda
      if (previousWeather === "rain") {
        stopRainEyesAnimation();
        gameState._isInRainAnimation = false;
        setTimeout(() => {
          updatePandaPixelArt();
        }, 100);
      }
      break;
  }
}

// Aplicar otimizações para dispositivos móveis
function applyMobileOptimizations() {
  if (isMobileDevice()) {
    // Reduzir o número de nuvens e efeitos visuais para melhor performance em dispositivos móveis
    const styles = document.createElement("style");
    styles.textContent = `
      .cloud:nth-child(n+5) {
        display: none;
      }
      .rainbow {
        opacity: 0.7;
      }
      .sparkle {
        animation-duration: 0.6s;
      }
    `;
    document.head.appendChild(styles);
  }
}

// Versão original de initGame
const originalInitGame = initGame;

// Substituir initGame com versão que aplica otimizações para móvel
initGame = function () {
  // Aplicar otimizações antes de iniciar o jogo
  applyMobileOptimizations();

  // Chamar a função original
  originalInitGame();
};

// Initialize game
function initGame() {
  loadGame();

  // Garantir que as flags de animação estejam resetadas ao iniciar
  gameState._isInRainAnimation = false;
  gameState._isBeingPet = false;
  gameState._isEating = false;
  gameState._wakingUp = false;

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

// Verifica se o dispositivo é móvel
function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
}

// Detector de orientação de tela para ajustar o layout
function handleOrientationChange() {
  if (isMobileDevice()) {
    // Salvar o estado atual do jogo
    saveGame();

    // Recarregar a página para aplicar o novo layout, mas com um pequeno delay
    // para permitir que o salvamento seja concluído
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }
}

// Adicionar listener para mudança de orientação
window.addEventListener("orientationchange", handleOrientationChange);

// Função para animar o rodapé de créditos
function animateFooter() {
  const footer = document.querySelector(".footer");
  const footerHearts = document.querySelectorAll(".footer-heart");

  if (footer && footerHearts.length > 0) {
    // Quando o usuário rola até o final da página, anima os corações
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const footerPosition = footer.offsetTop;

      if (scrollPosition > footerPosition) {
        footerHearts.forEach((heart, index) => {
          setTimeout(() => {
            heart.style.animation = "float 1.5s infinite alternate";
          }, index * 150);
        });
      }
    });

    // Adiciona efeito de pulsação nos corações quando passa o mouse sobre o rodapé
    footer.addEventListener("mouseenter", () => {
      footerHearts.forEach((heart, index) => {
        heart.style.animation = "heartbeat 0.8s infinite alternate";
      });
    });

    footer.addEventListener("mouseleave", () => {
      footerHearts.forEach((heart, index) => {
        heart.style.animation = "float 3s infinite alternate";
      });
    });
  }
}

// Adicionar animação de pulsação do coração
document.head.insertAdjacentHTML(
  "beforeend",
  `
<style>
@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
`
);

// Substituir initGame com versão que inclui a animação do rodapé
window.initGame = function () {
  // Chamar a função original se existir
  if (typeof originalInitGame === "function") {
    originalInitGame();
  }

  // Adicionar a animação do rodapé
  animateFooter();
  // Verifica se as imagens relacionadas ao clima estão carregadas
  checkWeatherImages();
};

// Start the game when page loads
window.addEventListener("load", function () {
  initGame();
  // initGame calls updateStats, which calls updatePandaAppearance, which will handle initial blinking state.
});
