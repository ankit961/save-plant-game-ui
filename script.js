// Initial plant state
let health = 80;
let growth = 0;
let energy = 60;
let currentWeather = "Sunny";
let pestAttack = false;
let drought = false;
let lastRestTime = 0;
let energyItemActive = false;

// Cooldown variables for actions
let lastWaterTime = 0;
let lastFertilizeTime = 0;
let lastPestSprayTime = 0;
let lastMulchTime = 0;
let lastPruneTime = 0;

const WATER_COOLDOWN = 60000;          // 1 minute
const FERTILIZE_COOLDOWN = 180000;     // 3 minutes
const PEST_SPRAY_COOLDOWN = 300000;    // 5 minutes
const MULCH_COOLDOWN = 600000;         // 10 minutes
const PRUNE_COOLDOWN = 420000;         // 7 minutes

// Event countdown
let eventCountdown = 30; // Event occurs every 30 seconds

// Weather conditions and their effects
const weatherConditions = {
    Sunny: { waterCost: 5, growthRate: 1, healthDecay: 0.5, energyBoost: 1 },
    Rainy: { waterCost: 3, growthRate: 1.2, healthDecay: 0.8, energyBoost: 1.2 },
    Windy: { waterCost: 6, growthRate: 0.9, healthDecay: 1.2, energyBoost: 0.9 },
    Stormy: { waterCost: 8, growthRate: 0.7, healthDecay: 2, energyBoost: 0.6 },
    Hot: { waterCost: 7, growthRate: 0.8, healthDecay: 1.8, energyBoost: 0.7 }
};

// Elements
const healthBar = document.getElementById("health");
const healthCounter = document.getElementById("healthCounter");
const growthBar = document.getElementById("growth");
const growthCounter = document.getElementById("growthCounter");
const energyBar = document.getElementById("energy");
const energyCounter = document.getElementById("energyCounter");
const plant = document.getElementById("plant");
const notification = document.getElementById("notification");
const weatherInfo = document.getElementById("weather");
const temperatureInfo = document.getElementById("temperature");
const eventTimer = document.getElementById("event-timer");
const endMessage = document.getElementById("endMessage");
const pestAttackIndicator = document.getElementById("pest-attack");
const droughtWarning = document.getElementById("drought-warning");
const restButton = document.getElementById("rest-button");
const energyItem = document.getElementById("energy-item");

// Function to update plant image based on growth
function updatePlantStage() {
    if (growth < 20) {
        plant.src = "seed.svg";
        plant.className = "plant seed";
    } else if (growth < 40) {
        plant.src = "sprout.svg";
        plant.className = "plant sprout";
    } else if (growth < 60) {
        plant.src = "plant-small.svg";
        plant.className = "plant plant-small";
    } else if (growth < 80) {
        plant.src = "plant-medium.svg";
        plant.className = "plant plant-medium";
    } else if (growth < 90) {
        plant.src = "plant-large.svg";
        plant.className = "plant plant-large";
    } else {
        plant.src = "plant-fullgrown.svg";
        plant.className = "plant plant-fullgrown";
    }
}

// Functions to update bars and counters
function updateHealth(amount) {
    health = Math.max(0, Math.min(100, health + amount));
    healthBar.style.width = health + "%";
    healthCounter.textContent = health.toFixed(2);
    checkGameOver();
}

function updateGrowth(amount) {
    growth = Math.max(0, Math.min(100, growth + amount));
    growthBar.style.width = growth + "%";
    growthCounter.textContent = growth.toFixed(2);
    updatePlantStage(); // Update plant image based on growth
    if (growth >= 100) endGame();
}

function updateEnergy(amount) {
    energy = Math.max(0, Math.min(100, energy + amount));
    energyBar.style.width = energy + "%";
    energyCounter.textContent = energy.toFixed(2);
}

// Action functions
function waterPlant() {
    const currentTime = Date.now();
    if (currentTime - lastWaterTime < WATER_COOLDOWN) {
        showNotification("⚠️ Over-watering harms the plant!");
        updateHealth(-5);
    } else {
        const waterCost = weatherConditions[currentWeather].waterCost;
        if (energy >= waterCost) {
            updateGrowth(5 * weatherConditions[currentWeather].growthRate);
            updateEnergy(-waterCost);
            updateHealth(2);
            showNotification("💧 Watering the plant...");
            lastWaterTime = currentTime;
        } else {
            showNotification("Not enough energy to water the plant!");
        }
    }
}

function fertilizePlant() {
    const currentTime = Date.now();
    if (currentTime - lastFertilizeTime < FERTILIZE_COOLDOWN) {
        showNotification("⚠️ Over-fertilizing harms the plant!");
        updateHealth(-8);
    } else {
        if (energy >= 10) {
            updateGrowth(10);
            updateEnergy(-10);
            showNotification("🌱 Fertilizing the plant...");
            lastFertilizeTime = currentTime;
        } else {
            showNotification("Not enough energy to fertilize the plant!");
        }
    }
}

function pestSpray() {
    const currentTime = Date.now();
    if (currentTime - lastPestSprayTime < PEST_SPRAY_COOLDOWN) {
        showNotification("⚠️ Pest spray overuse can damage the plant!");
        updateHealth(-5);
    } else {
        if (energy >= 15) {
            if (pestAttack) {
                pestAttack = false;
                pestAttackIndicator.style.display = "none";
                updateHealth(10);
                showNotification("🪲 Pest attack neutralized with pest spray!");
            } else {
                showNotification("Pest spray applied. No pests currently attacking.");
            }
            updateEnergy(-15);
            lastPestSprayTime = currentTime;
        } else {
            showNotification("Not enough energy to use pest spray!");
        }
    }
}

function mulch() {
    const currentTime = Date.now();
    if (currentTime - lastMulchTime < MULCH_COOLDOWN) {
        showNotification("⚠️ Too much mulch can suffocate the plant!");
        updateHealth(-5);
    } else {
        if (energy >= 20) {
            showNotification("🪵 Mulch applied! Plant is more drought-resistant.");
            droughtWarning.style.display = "none"; // Temporarily protects from drought
            updateEnergy(-20);
            lastMulchTime = currentTime;
        } else {
            showNotification("Not enough energy to apply mulch!");
        }
    }
}

function prune() {
    const currentTime = Date.now();
    if (currentTime - lastPruneTime < PRUNE_COOLDOWN) {
        showNotification("⚠️ Over-pruning harms the plant!");
        updateHealth(-3);
    } else {
        if (energy >= 10) {
            showNotification("✂️ Pruning done! Growth slightly boosted.");
            updateGrowth(5); // Small growth boost
            updateEnergy(-10);
            lastPruneTime = currentTime;
        } else {
            showNotification("Not enough energy to prune the plant!");
        }
    }
}

function shadeProtection() {
    if (currentWeather === "Hot" && energy >= 8) {
        showNotification("🛡️ Shade applied! Plant protected from harsh sunlight.");
        updateEnergy(-8);
        updateHealth(5); // Slight health boost for protection
    } else if (currentWeather !== "Hot") {
        showNotification("Shade protection is only effective in hot weather.");
    } else {
        showNotification("Not enough energy to apply shade protection!");
    }
}

// Daily update for events, weather, and pest attacks
function dailyUpdate() {
    // Change weather randomly
    currentWeather = Object.keys(weatherConditions)[Math.floor(Math.random() * 5)];
    weatherInfo.textContent = `Weather: ${currentWeather}`;
    temperatureInfo.textContent = `Temperature: ${Math.floor(Math.random() * 15) + 15}°C`;
    updateBackground();

    // Apply health decay based on current weather
    const weatherDecay = -weatherConditions[currentWeather].healthDecay;
    updateHealth(weatherDecay);

    // Trigger random pest attack or drought
    pestAttack = Math.random() < 0.4;
    drought = Math.random() < 0.3;
    pestAttackIndicator.style.display = pestAttack ? "block" : "none";
    droughtWarning.style.display = drought ? "block" : "none";

    // Apply additional decay if pest attack or drought is active
    if (pestAttack) {
        updateHealth(-10);  // Stronger health reduction for pest attack
        showNotification("⚠️ Pest attack is affecting your plant's health!");
    }
    if (drought) {
        updateHealth(-7);   // Stronger health reduction for drought
        showNotification("🌞 Drought is affecting your plant's health!");
    }
}

// Countdown for event timer
function updateEventTimer() {
    eventTimer.textContent = `Event in: ${eventCountdown}s`;
    eventCountdown--;

    if (eventCountdown < 0) {
        dailyUpdate(); // Trigger daily update
        eventCountdown = 30; // Reset the countdown
    }
}

// Call updateEventTimer every second to update the countdown display
setInterval(updateEventTimer, 1000);

// Function to update background based on weather
function updateBackground() {
    document.body.className = currentWeather.toLowerCase();
}

// Generate energy-boosting item randomly
function generateEnergyItem() {
    if (!energyItemActive) {
        energyItem.style.display = "block";
        energyItemActive = true;
        setTimeout(() => {
            energyItem.style.display = "none";
            energyItemActive = false;
        }, 10000); // Energy item disappears if not collected within 10 seconds
    }
}

// Call generateEnergyItem at random intervals (every 60 seconds)
setInterval(generateEnergyItem, 60000);

function collectEnergyItem() {
    if (energyItemActive) {
        updateEnergy(10);
        showNotification("🍎 Energy boost collected! +10 Energy");
        energyItem.style.display = "none";
        energyItemActive = false;
    }
}

// Display notification messages
function showNotification(message) {
    notification.textContent = message;
    notification.style.opacity = 1;
    setTimeout(() => notification.style.opacity = 0, 1500);
}

// Check if health is zero and end the game
function checkGameOver() {
    if (health <= 0) {
        endMessage.textContent = "💀 Your plant didn't survive.";
        endMessage.style.display = "block";
        disableAllButtons();
    }
}

function endGame() {
    endMessage.textContent = "🌳 Congratulations! Your plant is fully grown!";
    endMessage.style.display = "block";
    disableAllButtons();
}

function disableAllButtons() {
    document.querySelectorAll(".actions button").forEach(button => button.disabled = true);
}

// Initial setup for displaying counters and starting first daily update
updateHealth(0);
updateGrowth(0);
updateEnergy(0);
dailyUpdate();
