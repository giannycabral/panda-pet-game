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
    totalShowers: 0, // Nova estatística para banhos
  },

  // Nova flag para controle de animação de acordar
  _wakingUp: false,

  // Novas flags para controle de ações específicas
  _isEating: false,
  _isBeingPet: false,
  _isShowering: false, // Nova flag para banho
};

// Funções de animação para o panda com diferentes climas
// Estas funções foram atualizadas para lidar com todos os climas
function startRainEyesAnimation() {
  // Esta função é especificamente para o clima de chuva
  // Verificamos o estado atual do jogo
  if (currentWeather === "rain") {
    if (gameState._isEating) {
      // Se estiver comendo, mostra panda-rain-eat
      const el = document.getElementById("panda-rain-eat");
      if (el) {
        hideAllPandas();
        el.style.display = "block";
        el.classList.add("panda-breathing");
      }
    } else if (gameState._isBeingPet) {
      // Se estiver recebendo carinho, mostra panda-rain-pet
      const el = document.getElementById("panda-rain-pet");
      if (el) {
        hideAllPandas();
        el.style.display = "block";
        el.classList.add("panda-breathing");
      }
    } else if (
      gameState.hunger <= 50 || 
      gameState.happiness <= 50 || 
      gameState.energy <= 50
    ) {
      // Se alguma estatística estiver baixa, mostra panda-rain-sad
      const el = document.getElementById("panda-rain-sad");
      if (el) {
        hideAllPandas();
        el.style.display = "block";
        el.classList.add("panda-breathing");
      }
    } else {
      // Estado normal na chuva
      const el = document.getElementById("panda-rain");
      if (el) {
        hideAllPandas();
        el.style.display = "block";
        el.classList.add("panda-breathing");
      }
    }
  } else {
    // Se não estiver chovendo, simplesmente atualizamos o panda
    updatePandaPixelArt();
  }
}

function stopRainEyesAnimation() {
  // Reseta o estado de animação do panda
  gameState._isInRainAnimation = false;
  
  // Atualiza a visualização do panda baseado no estado atual do jogo
  updatePandaPixelArt();
}

// Função auxiliar para esconder todos os pandas
function hideAllPandas() {
  const pandaImgs = [
    "panda-awake",
    "panda-sit",
    "panda-sleep",
    "panda-sad",
    "panda-eat",
    "panda-rain",
    "panda-rain-eat",
    "panda-rain-pet",
    "panda-rain-sleep",
    "panda-rain-sad"
  ];
  
  pandaImgs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "none";
      el.classList.remove("panda-breathing");
      // Remove também as classes específicas de clima
      if (el.id === "panda-awake") {
        el.classList.remove("weather-sunny", "weather-clear", "weather-snow");
      }
    }
  });
}

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
  // Aplica a mesma técnica de reflow para a barra de fome
  const hungerBar = document.getElementById("hunger-bar");
  if (hungerBar) {
    // Força reflow para garantir atualização visual imediata
    hungerBar.style.display = "none";
    // eslint-disable-next-line no-unused-expressions
    hungerBar.offsetHeight; // trigger reflow
    hungerBar.style.display = "block";
    hungerBar.style.width = `${gameState.hunger}%`;
  }
  document.getElementById("hunger-value").textContent = `${Math.round(
    gameState.hunger
  )}%`;

  // Aplica a mesma técnica de reflow usada na barra de energia para garantir atualização visual
  const happinessBar = document.getElementById("happiness-bar");
  if (happinessBar) {
    // Força reflow para garantir atualização visual imediata
    happinessBar.style.display = "none";
    // eslint-disable-next-line no-unused-expressions
    happinessBar.offsetHeight; // trigger reflow
    happinessBar.style.display = "block";
    happinessBar.style.width = `${gameState.happiness}%`;
  }
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

  // Update sleep bubble with debug
  const sleepBubble = document.getElementById("sleep-bubble");
  if (sleepBubble) {
    console.log("Atualizando sleep-bubble...");
    console.log("Estado sleeping:", gameState.sleeping);
    sleepBubble.style.opacity = gameState.sleeping ? "1" : "0";
    console.log("Nova opacidade:", sleepBubble.style.opacity);
  } else {
    console.error("Sleep bubble não encontrada!");
  }

  // Update panda appearance
  updatePandaPixelArt();
}

// Atualiza a aparência do panda pixel art
function updatePandaPixelArt() {
  // IDs reais dos pandas/gifs usados no HTML
  const pandaImgs = [
    "panda-awake",
    "panda-sit",
    "panda-sleep",
    "panda-sad",
    "panda-eat",
    "panda-rain",
    "panda-rain-eat",
    "panda-rain-pet",
    "panda-rain-sleep",
    "panda-rain-sad",
    "panda-shower",
    "panda-rain-shower"
  ];
  pandaImgs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "none";
      el.classList.remove("panda-breathing");
    }
  });

  // 1. Triste (chuva: panda-rain-sad, normal: panda-sad)
  if (
    (gameState.hunger <= 50 || gameState.happiness <= 50 || gameState.energy <= 50) &&
    !gameState._isEating &&
    !gameState._isBeingPet &&
    !gameState.sleeping
  ) {
    if (currentWeather === "rain") {
      let rainSad = document.getElementById("panda-rain-sad");
      if (!rainSad) {
        rainSad = document.createElement("img");
        rainSad.id = "panda-rain-sad";
        rainSad.src = "img/panda-rain-sad.png";
        rainSad.alt = "Panda triste na chuva";
        rainSad.className = "panda-pixel panda-rain-sad";
        rainSad.style.display = "none";
        rainSad.setAttribute("draggable", "false");
        rainSad.setAttribute("aria-hidden", "true");
        rainSad.setAttribute("role", "img");
        document.getElementById("panda-container").appendChild(rainSad);
      }
      rainSad.style.display = "block";
      rainSad.classList.add("panda-breathing");
    } else {
      const sad = document.getElementById("panda-sad");
      if (sad) {
        sad.style.display = "block";
        sad.classList.add("panda-breathing");
      }
    }
    return;
  }


  // 2. Dormindo
  if (gameState.sleeping) {
    // Mostra a bolha de sono primeiro
    const sleepBubble = document.getElementById("sleep-bubble");
    if (sleepBubble) {
      sleepBubble.style.opacity = "1";
      sleepBubble.style.display = "block";
      sleepBubble.style.zIndex = "999";
      console.log("Sleep bubble deve estar visível agora:", sleepBubble);
    } else {
      console.error("Sleep bubble não encontrada no updatePandaPixelArt!");
    }

    if (currentWeather === "rain") {
      const rainSleep = document.getElementById("panda-rain-sleep");
      console.log("Tentando mostrar panda dormindo na chuva");
      if (rainSleep) {
        console.log("Elemento panda-rain-sleep encontrado");
        hideAllPandas(); // Esconde todos os outros pandas primeiro
        rainSleep.style.display = "block";
        rainSleep.classList.add("panda-breathing");
        console.log("Panda dormindo na chuva deve estar visível agora");
      } else {
        console.error("Elemento panda-rain-sleep não encontrado!");
      }
    } else {
      const sleep = document.getElementById("panda-sleep");
      if (sleep) {
        hideAllPandas();
        sleep.style.display = "block";
        sleep.classList.add("panda-breathing");
      }
    }
    return;
  }

  // 3. Carinho
  if (gameState._isBeingPet) {
    if (currentWeather === "rain") {
      const rainPet = document.getElementById("panda-rain-pet");
      if (rainPet) {
        rainPet.style.display = "block";
        rainPet.classList.add("panda-breathing");
      }
    } else {
      const sit = document.getElementById("panda-sit");
      if (sit) {
        sit.style.display = "block";
        sit.classList.add("panda-breathing");
      }
    }
    return;
  }

  // 4. Comendo
  if (gameState._isEating) {
    if (currentWeather === "rain") {
      const rainEat = document.getElementById("panda-rain-eat");
      if (rainEat) {
        rainEat.style.display = "block";
        rainEat.classList.add("panda-breathing");
      }
    } else {
      const eat = document.getElementById("panda-eat");
      if (eat) {
        eat.style.display = "block";
        eat.classList.add("panda-breathing");
      }
    }
    return;
  }
  
  // Nova verificação: 4.5. Tomando banho
  if (gameState._isShowering) {
    if (currentWeather === "rain") {
      // Criar ou obter o elemento panda-rain-shower
      let rainShower = document.getElementById("panda-rain-shower");
      if (!rainShower) {
        rainShower = document.createElement("img");
        rainShower.id = "panda-rain-shower";
        rainShower.src = "img/panda-rain-shower.png";
        rainShower.alt = "Panda tomando banho na chuva";
        rainShower.className = "panda-pixel panda-rain-shower";
        rainShower.style.display = "none";
        rainShower.setAttribute("draggable", "false");
        rainShower.setAttribute("aria-hidden", "true");
        rainShower.setAttribute("role", "img");
        document.getElementById("panda-container").appendChild(rainShower);
      }
      rainShower.style.display = "block";
      rainShower.classList.add("panda-breathing");
    } else {
      // Criar ou obter o elemento panda-shower
      let shower = document.getElementById("panda-shower");
      if (!shower) {
        shower = document.createElement("img");
        shower.id = "panda-shower";
        shower.src = "img/panda-normal-shower.png";
        shower.alt = "Panda tomando banho";
        shower.className = "panda-pixel panda-shower";
        shower.style.display = "none";
        shower.setAttribute("draggable", "false");
        shower.setAttribute("aria-hidden", "true");
        shower.setAttribute("role", "img");
        document.getElementById("panda-container").appendChild(shower);
      }
      shower.style.display = "block";
      shower.classList.add("panda-breathing");
    }
    return;
  }

  // 5. Verificação específica por clima
  // 5.1 Chuva
  if (currentWeather === "rain") {
    const rain = document.getElementById("panda-rain");
    if (rain) {
      rain.style.display = "block";
      rain.classList.add("panda-breathing");
    }
    return;
  }
  
  // 5.2 Clima normal (sunny, clear, snow)
  // Todos os outros climas usam o panda normal
  const awake = document.getElementById("panda-awake");
  // Para climas especiais, podemos adicionar classes adicionais para efeitos visuais
  if (awake) {
    awake.style.display = "block";
    awake.classList.add("panda-breathing");
    
    // Adicionar classes específicas por clima (para possíveis efeitos CSS)
    awake.classList.remove("weather-sunny", "weather-clear", "weather-snow");
    if (currentWeather === "sunny") {
      awake.classList.add("weather-sunny");
    } else if (currentWeather === "clear") {
      awake.classList.add("weather-clear");
    } else if (currentWeather === "snow") {
      awake.classList.add("weather-snow");
    }
  }
  return;
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
  // Remove qualquer bamboo anterior
  const oldBamboo = document.getElementById("bamboo-food");
  if (oldBamboo) oldBamboo.remove();
  // Cria o bamboo (comida)
  const bamboo = document.createElement("div");
  bamboo.className = "bamboo";
  bamboo.id = "bamboo-food";
  bamboo.style.position = "absolute";
  bamboo.style.top = "60%";
  bamboo.style.left = "50%";
  bamboo.style.transform = "translate(-50%, 0)";
  bamboo.style.zIndex = "20";
  const leaf = document.createElement("div");
  leaf.className = "bamboo-leaf";
  bamboo.appendChild(leaf);
  pandaContainer.appendChild(bamboo);

  setTimeout(() => {
    bamboo.style.transform = "translate(-50%, 0) scale(0.8)";
    bamboo.style.opacity = "0";
    const previousHunger = gameState.hunger;
    gameState.hunger = Math.min(100, gameState.hunger + 20);
    console.log(`Fome aumentou: ${previousHunger} -> ${gameState.hunger}`);
    
    gameState._isEating = false;
    updateStats();
    
    // Garante que as barras sejam atualizadas corretamente
    setTimeout(fixProgressBars, 100);
    document.getElementById("message").textContent =
      "Nyam nyam! Delicioso! 🎋😋";
    setTimeout(() => {
      bamboo.remove();
      // Após comer, volta para o panda padrão do clima
      updatePandaPixelArt();
    }, 500);
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
  // A função stopBlinking() foi removida nas refatorações anteriores
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
  // Aumenta a felicidade e garante que não ultrapasse 100
  const previousHappiness = gameState.happiness;
  gameState.happiness = Math.min(100, gameState.happiness + 15);
  
  console.log(`Felicidade aumentou: ${previousHappiness} -> ${gameState.happiness}`);
  
  gameState.lastUpdate = Date.now();
  updateStats(); // Atualiza a interface com os novos valores
  
  // Garante que as barras sejam atualizadas corretamente
  setTimeout(fixProgressBars, 100);
  const wasRainingBeforePet = currentWeather === "rain";

  setTimeout(() => {
    gameState._isBeingPet = false;

    // Se estava chovendo antes, volta para panda-rain-awake
    if (wasRainingBeforePet && currentWeather === "rain") {
      updatePandaPixelArt();
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

  const sleepBubble = document.getElementById("sleep-bubble");
  const message = document.getElementById("message");
  const sleepBtn = document.getElementById("sleep-btn");

  if (gameState.sleeping) {
    // Preparar para dormir
    gameState._isEating = false;
    gameState._isBeingPet = false;
    message.textContent = "Zzz... Seu panda está dormindo! 😴💤";
    sleepBtn.innerHTML = "<span>🌞 Acordar</span>";

    // Mostrar sleep bubble
    if (sleepBubble) {
      sleepBubble.style.display = "flex";
      // Forçar um reflow antes de mudar a opacidade para garantir a animação
      sleepBubble.offsetHeight;
      sleepBubble.style.opacity = "1";
    }
  } else {
    // Acordar
    message.textContent = "Seu panda acordou! 🌞✨";
    sleepBtn.innerHTML = "<span>😴 Dormir</span>";
    
    // Esconder sleep bubble
    if (sleepBubble) {
      sleepBubble.style.opacity = "0";
    }

    gameState._wakingUp = true;
  }

  // Atualizar aparência
  updatePandaPixelArt();

  if (!gameState.sleeping) {
    setTimeout(() => {
      gameState._wakingUp = false;
      updateStats();
      if (currentWeather === "rain") {
        updatePandaPixelArt();
      }
    }, 500);
  } else {
    updateStats();
  }
}

// Função para dar banho no panda
function giveShower() {
  if (
    gameState.sleeping ||
    gameState._wakingUp ||
    gameState._isEating ||
    gameState._isBeingPet ||
    gameState._isShowering
  )
    return;
  
  // Tocar som de felicidade como placeholder para o banho
  playSound("happy");
  gameState.stats.totalShowers++;
  
  gameState._isShowering = true;
  updatePandaPixelArt();
  document.getElementById("message").textContent =
    "Seu panda está tomando banho! 🚿💦";
  
  // Criar efeito de respingos d'água
  const pandaContainer = document.getElementById("panda-container");
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const splash = document.createElement("div");
      splash.className = "water-splash";
      splash.style.left = (40 + Math.random() * 60) + "%";
      splash.style.top = (30 + Math.random() * 40) + "%";
      splash.style.animationDuration = (0.5 + Math.random() * 1) + "s";
      pandaContainer.appendChild(splash);
      
      setTimeout(() => splash.remove(), 1000);
    }, i * 100);
  }
  
  setTimeout(() => {
    gameState.happiness = Math.min(100, gameState.happiness + 15);
    gameState.energy = Math.min(100, gameState.energy + 5);
    gameState._isShowering = false;
    updateStats();
  }, 5000);
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

// Função para verificar e corrigir problemas com as barras de progresso
function fixProgressBars() {
  // Verifica e corrige as barras de progresso
  console.log("Verificando e corrigendo barras de progresso...");
  console.log(`Estado atual: Fome=${gameState.hunger}%, Felicidade=${gameState.happiness}%, Energia=${gameState.energy}%`);
  
  // Força a atualização de todas as barras usando a técnica de reflow
  const bars = [
    { id: "hunger-bar", value: gameState.hunger },
    { id: "happiness-bar", value: gameState.happiness },
    { id: "energy-bar", value: gameState.energy }
  ];
  
  bars.forEach(bar => {
    const element = document.getElementById(bar.id);
    if (element) {
      // Força reflow
      element.style.display = "none";
      // eslint-disable-next-line no-unused-expressions
      element.offsetHeight;
      element.style.display = "block";
      element.style.width = `${bar.value}%`;
      console.log(`Barra ${bar.id} atualizada para ${bar.value}%`);
    } else {
      console.error(`Elemento ${bar.id} não encontrado!`);
    }
    
    // Atualiza também o valor textual
    const valueElement = document.getElementById(`${bar.id.split('-')[0]}-value`);
    if (valueElement) {
      valueElement.textContent = `${Math.round(bar.value)}%`;
    }
  });
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
          // rainImg.style.transition = "opacity 0.8s ease-in-out";
          rainImg.style.opacity = "0";
          rainImg.style.display = "block";
          rainImg.classList.add("panda-breathing");

          // Fade out do panda atual
          // currentVisiblePanda.style.transition = "opacity 0.6s ease-out";
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

// Log de debug para visualizar mudanças de estado
function logGameState(action) {
  console.log(`[DEBUG] ${action}`);
  console.log(`Clima atual: ${currentWeather}`);
  console.log(`Dormindo: ${gameState.sleeping}`);
  console.log(`Elemento panda-rain-sleep visível: ${document.getElementById('panda-rain-sleep')?.style.display === 'block'}`);
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
  
  // Corrige as barras de progresso após inicializar
  setTimeout(fixProgressBars, 500);

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
  document.getElementById("shower-btn").addEventListener("click", giveShower);

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

// Inicializa os logs de depuração para novas features
logShowerEvent("Configurando logs para funcionalidade de banho");

// Start the game when page loads
window.addEventListener("load", function () {
  initGame();
  // initGame calls updateStats, which calls updatePandaPixelArt, which will handle initial appearance.
  console.log("Jogo inicializado com sucesso! Versão com nova feature de banho");
});

// Função para logs de depuração da feature de banho
function logShowerEvent(message) {
  console.log(`[BANHO] ${message}`);
  
  // Versão melhorada da função giveShower com logs
  giveShower = function() {
    logShowerEvent("Início da função giveShower");
    
    if (
      gameState.sleeping ||
      gameState._wakingUp ||
      gameState._isEating ||
      gameState._isBeingPet ||
      gameState._isShowering
    ) {
      logShowerEvent("Banho cancelado: panda ocupado com outra atividade");
      return;
    }
    
    // Tocar som de felicidade como placeholder para o banho
    playSound("happy");
    gameState.stats.totalShowers++;
    logShowerEvent(`Total de banhos: ${gameState.stats.totalShowers}`);
    
    gameState._isShowering = true;
    updatePandaPixelArt();
    document.getElementById("message").textContent = "Seu panda está tomando banho! 🚿💦";
    logShowerEvent("Estado _isShowering ativado, mensagem atualizada");
    
    // Criar efeito de respingos d'água
    const pandaContainer = document.getElementById("panda-container");
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const splash = document.createElement("div");
        splash.className = "water-splash";
        splash.style.left = (40 + Math.random() * 60) + "%";
        splash.style.top = (30 + Math.random() * 40) + "%";
        splash.style.animationDuration = (0.5 + Math.random() * 1) + "s";
        pandaContainer.appendChild(splash);
        
        setTimeout(() => splash.remove(), 1000);
      }, i * 100);
    }
    logShowerEvent("Efeitos de respingo de água criados");
    
    setTimeout(() => {
      const prevHappiness = gameState.happiness;
      const prevEnergy = gameState.energy;
      
      gameState.happiness = Math.min(100, gameState.happiness + 15);
      gameState.energy = Math.min(100, gameState.energy + 5);
      
      logShowerEvent(`Felicidade aumentou: ${prevHappiness} -> ${gameState.happiness}`);
      logShowerEvent(`Energia aumentou: ${prevEnergy} -> ${gameState.energy}`);
      
      gameState._isShowering = false;
      logShowerEvent("Estado _isShowering desativado");
      
      updateStats();
      logShowerEvent("Estatísticas atualizadas, banho concluído");
    }, 5000);
  };
}

// Função para garantir que o sleep-bubble exista
function ensureSleepBubble() {
  let sleepBubble = document.getElementById("sleep-bubble");
  
  if (!sleepBubble) {
    console.log("Sleep bubble não encontrado! Criando um novo...");
    sleepBubble = document.createElement("div");
    sleepBubble.id = "sleep-bubble";
    sleepBubble.className = "sleep-bubble";
    sleepBubble.setAttribute("aria-label", "Balão de sono do panda");
    
    // Adicionar o Zzz manualmente
    const zzz = document.createElement("div");
    zzz.textContent = "Zzz";
    zzz.style.position = "absolute";
    zzz.style.top = "30px";
    zzz.style.left = "35px";
    zzz.style.fontSize = "3rem";
    zzz.style.fontFamily = "'Baloo 2', cursive";
    zzz.style.color = "#8b5cf6";
    zzz.style.textShadow = "2px 2px 0 rgba(139, 92, 246, 0.3)";
    sleepBubble.appendChild(zzz);
    
    const pandaContainer = document.getElementById("panda-container");
    if (pandaContainer) {
      pandaContainer.appendChild(sleepBubble);
      console.log("Sleep bubble adicionado ao panda-container!");
    } else {
      document.body.appendChild(sleepBubble);
      console.log("Sleep bubble adicionado ao body como fallback!");
    }
  }
  
  return sleepBubble;
}
