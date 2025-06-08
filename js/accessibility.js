/**
 * Funções de acessibilidade para o Panda Pet Game
 * Complementa o arquivo game.js existente
 */

document.addEventListener('DOMContentLoaded', function() {
    enhanceAccessibility();
});

/**
 * Verifica se estamos na página principal do jogo
 */
function isMainGamePage() {
    // Verifica se elementos essenciais do jogo existem
    return document.getElementById('panda-container') !== null && 
           typeof gameState !== 'undefined';
}

/**
 * Melhora a acessibilidade geral do jogo
 */
function enhanceAccessibility() {
    // Configuração básica de navegação por teclado em todas as páginas
    setupKeyboardNavigation();
    
    // Configurações específicas da página principal do jogo
    if (isMainGamePage()) {
        setupAriaUpdates();
        setupStatusAnnouncements();
    }
}

/**
 * Configura atualizações dos atributos ARIA para as barras de progresso
 */
function setupAriaUpdates() {
    // Verifica se todos os elementos necessários existem antes de configurar
    if (!document.getElementById('hunger-value') || 
        !document.getElementById('happiness-value') || 
        !document.getElementById('energy-value')) {
        console.log("Elementos de status do jogo não encontrados, pulando configuração de ARIA");
        return;
    }
    
    // Intervalo para sincronizar valores ARIA com os valores visuais
    setInterval(() => {
        try {
            // Atualiza ARIA para a barra de fome
            const hungerElement = document.getElementById('hunger-value');
            const hungerBar = document.querySelector('[aria-labelledby="hunger-label"]');
            if (hungerElement && hungerBar) {
                const hungerValue = parseInt(hungerElement.textContent);
                hungerBar.setAttribute('aria-valuenow', hungerValue);
            }
            
            // Atualiza ARIA para a barra de felicidade
            const happinessElement = document.getElementById('happiness-value');
            const happinessBar = document.querySelector('[aria-labelledby="happiness-label"]');
            if (happinessElement && happinessBar) {
                const happinessValue = parseInt(happinessElement.textContent);
                happinessBar.setAttribute('aria-valuenow', happinessValue);
            }
            
            // Atualiza ARIA para a barra de energia
            const energyElement = document.getElementById('energy-value');
            const energyBar = document.querySelector('[aria-labelledby="energy-label"]');
            if (energyElement && energyBar) {
                const energyValue = parseInt(energyElement.textContent);
                energyBar.setAttribute('aria-valuenow', energyValue);
            }
        } catch (error) {
            console.log("Erro ao atualizar valores ARIA:", error);
        }
    }, 1000);
}

/**
 * Configura navegação por teclado para elementos interativos
 */
function setupKeyboardNavigation() {
    // Melhora foco em elementos interativos
    const interactiveElements = document.querySelectorAll('button, a');
    interactiveElements.forEach(el => {
        el.addEventListener('keydown', (e) => {
            // Ativa elementos com Enter ou Espaço
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                el.click();
            }
        });
    });
}

/**
 * Configura anúncios de status para tecnologias assistivas
 */
function setupStatusAnnouncements() {
    // Verifica se o estado do jogo existe antes de configurar
    if (typeof gameState === 'undefined') {
        console.log("Estado do jogo não encontrado, pulando configuração de anúncios");
        return;
    }
    
    // Cria um elemento para anúncios de tecnologia assistiva
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.classList.add('sr-only');
    document.body.appendChild(announcer);
    
    // Armazena os valores anteriores para evitar anúncios repetidos
    let prevHunger = 100;
    let prevHappiness = 100;
    let prevEnergy = 100;
    
    // Verifica alterações significativas nos status
    setInterval(() => {
        try {
            if (typeof gameState !== 'undefined') {
                const hunger = gameState.hunger;
                const happiness = gameState.happiness;
                const energy = gameState.energy;
                
                // Anuncia mudanças significativas (mais de 20%)
                if (Math.abs(hunger - prevHunger) >= 20) {
                    announceStatus('fome', hunger);
                    prevHunger = hunger;
                }
                
                if (Math.abs(happiness - prevHappiness) >= 20) {
                    announceStatus('felicidade', happiness);
                    prevHappiness = happiness;
                }
                
                if (Math.abs(energy - prevEnergy) >= 20) {
                    announceStatus('energia', energy);
                    prevEnergy = energy;
                }
            }
        } catch (error) {
            console.log("Erro ao verificar status do jogo:", error);
        }
    }, 5000);
}

/**
 * Anuncia alterações de status para tecnologias assistivas
 */
function announceStatus(type, value) {
    const announcer = document.querySelector('.sr-only');
    let message;
    
    if (value <= 20) {
        message = `Atenção! Nível de ${type} muito baixo: ${value}%`;
    } else if (value >= 80) {
        message = `${type} em bom nível: ${value}%`;
    } else {
        message = `${type} em ${value}%`;
    }
    
    announcer.textContent = message;
}

// Adicionando classe sr-only se não estiver definida no CSS
if (!document.querySelector('style#accessibility-extras')) {
    const style = document.createElement('style');
    style.id = 'accessibility-extras';
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    document.head.appendChild(style);
}
