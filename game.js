// Game State
const gameState = {
    money: 20, // Start with some money for planting
    farmWidth: 3,
    farmHeight: 3,
    plots: [],
    
    // Upgrade levels
    propertyLevel: 1,
    harvesterLevel: 0,
    planterLevel: 0,
    cropLevel: 1,
    fertilizerLevel: 0,
    soilLevel: 0,
    irrigationLevel: 0,
    autoPlantUnlocked: false,
    autoHarvestUnlocked: false,
    
    // Upgrade costs
    propertyCost: 100,
    harvesterCost: 50,
    planterCost: 75,
    cropCost: 200,
    fertilizerCost: 100,
    soilCost: 250,
    irrigationCost: 500,
    autoPlantCost: 150,
    autoHarvestCost: 100,
    
    // Game mechanics
    baseCropGrowthTime: 15000, // ms - slowed down for idle game
    harvestValue: 10,
    autoHarvestSpeed: 1000, // ms between auto harvests
    autoPlantSpeed: 1500, // ms between auto plants
    
    lastUpdate: Date.now(),
    lastAutoHarvest: Date.now(),
    lastAutoPlant: Date.now(),
    
    // Selected crop for planting
    selectedCropIndex: 0
};

// Crop types with emojis - ordered by progression
const cropTypes = [
    { name: 'Wheat', emoji: '🌾', baseValue: 10, unlockCost: 0, unlocked: true, plantCost: 2 },
    { name: 'Corn', emoji: '�', baseValue: 25, unlockCost: 125, unlocked: false, plantCost: 5 },
    { name: 'Apple', emoji: '�', baseValue: 60, unlockCost: 300, unlocked: false, plantCost: 12 },
    { name: 'Eggplant', emoji: '🍆', baseValue: 150, unlockCost: 750, unlocked: false, plantCost: 30 },
    { name: 'Squash', emoji: '🎃', baseValue: 375, unlockCost: 1875, unlocked: false, plantCost: 75 },
    { name: 'Garlic', emoji: '🧄', baseValue: 950, unlockCost: 4750, unlocked: false, plantCost: 190 }
];

// Get current crop growth time with upgrades
function getCropGrowthTime() {
    let time = gameState.baseCropGrowthTime;
    // Each upgrade reduces growth time by 15%
    if (gameState.fertilizerLevel > 0) {
        time *= Math.pow(0.85, gameState.fertilizerLevel);
    }
    if (gameState.soilLevel > 0) {
        time *= Math.pow(0.85, gameState.soilLevel);
    }
    if (gameState.irrigationLevel > 0) {
        time *= Math.pow(0.85, gameState.irrigationLevel);
    }
    return time;
}

// Plot states: 'empty', 'growing', 'ready'
class Plot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = 'empty';
        this.plantTime = null;
        this.cropType = null;
        this.lastCropIndex = 0; // Remember last planted crop
    }
    
    plant(cropIndex) {
        if (this.state === 'empty') {
            const crop = cropTypes[cropIndex];
            if (!crop.unlocked) return false;
            
            // Check if player has enough money
            if (gameState.money >= crop.plantCost) {
                gameState.money -= crop.plantCost;
                this.state = 'growing';
                this.plantTime = Date.now();
                this.cropType = crop;
                this.lastCropIndex = cropIndex; // Remember this choice
                return true;
            }
            return false;
        }
        return false;
    }
    
    update() {
        if (this.state === 'growing') {
            const elapsed = Date.now() - this.plantTime;
            if (elapsed >= getCropGrowthTime()) {
                this.state = 'ready';
            }
        }
    }
    
    harvest() {
        if (this.state === 'ready') {
            const cropValue = this.cropType ? this.cropType.baseValue : gameState.harvestValue;
            this.state = 'empty';
            this.plantTime = null;
            const harvestedCrop = this.cropType;
            this.cropType = null;
            return cropValue * gameState.cropLevel;
        }
        return 0;
    }
    
    getGrowthProgress() {
        if (this.state !== 'growing') return 0;
        const elapsed = Date.now() - this.plantTime;
        return Math.min(elapsed / getCropGrowthTime(), 1);
    }
}

// Initialize farm
function initializeFarm() {
    gameState.plots = [];
    for (let y = 0; y < gameState.farmHeight; y++) {
        for (let x = 0; x < gameState.farmWidth; x++) {
            gameState.plots.push(new Plot(x, y));
        }
    }
    
    // Don't auto-plant initial crops - player must plant manually or buy auto-planter
}

// Canvas rendering
const canvas = document.getElementById('farm-canvas');
const ctx = canvas.getContext('2d');

function drawFarm() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const spacing = 4; // Space between plots
    const plotSize = Math.min(
        (canvas.width - 40) / gameState.farmWidth - spacing,
        (canvas.height - 40) / gameState.farmHeight - spacing
    );
    const borderRadius = 8; // Rounded corners
    
    const totalWidth = gameState.farmWidth * (plotSize + spacing) - spacing;
    const totalHeight = gameState.farmHeight * (plotSize + spacing) - spacing;
    const offsetX = (canvas.width - totalWidth) / 2;
    const offsetY = (canvas.height - totalHeight) / 2;
    
    gameState.plots.forEach(plot => {
        const x = offsetX + plot.x * (plotSize + spacing);
        const y = offsetY + plot.y * (plotSize + spacing);
        
        // Helper function to draw rounded rectangle
        const drawRoundRect = (x, y, width, height, radius, fill = true) => {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            if (fill) ctx.fill();
            else ctx.stroke();
        };
        
        // Draw plot background
        ctx.fillStyle = '#8B4513';
        drawRoundRect(x, y, plotSize, plotSize, borderRadius);
        
        // Draw crop state
        if (plot.state === 'empty') {
            ctx.fillStyle = '#654321';
            drawRoundRect(x + 4, y + 4, plotSize - 8, plotSize - 8, borderRadius - 2);
            
            // Show last planted crop indicator if exists
            if (plot.lastCropIndex >= 0 && cropTypes[plot.lastCropIndex]) {
                const lastCrop = cropTypes[plot.lastCropIndex];
                if (plotSize > 40) {
                    ctx.font = `${Math.floor(plotSize * 0.25)}px Arial`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(lastCrop.emoji, x + plotSize / 2, y + plotSize / 2);
                }
            }
        } else if (plot.state === 'growing') {
            const progress = plot.getGrowthProgress();
            // Growing crop - shade of green based on progress
            const greenValue = Math.floor(100 + (progress * 155));
            ctx.fillStyle = `rgb(50, ${greenValue}, 50)`;
            drawRoundRect(x + 4, y + 4, plotSize - 8, plotSize - 8, borderRadius - 2);
            
            // Draw emoji and name if plot is large enough
            if (plot.cropType) {
                if (plotSize > 40) {
                    ctx.font = `${Math.floor(plotSize * 0.35)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(plot.cropType.emoji, x + plotSize / 2, y + plotSize / 2 - plotSize * 0.1);
                    
                    // Draw crop name
                    ctx.font = `${Math.floor(plotSize * 0.12)}px Arial`;
                    ctx.fillStyle = '#fff';
                    ctx.fillText(plot.cropType.name, x + plotSize / 2, y + plotSize / 2 + plotSize * 0.2);
                } else if (plotSize > 30) {
                    ctx.font = `${Math.floor(plotSize * 0.4)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(plot.cropType.emoji, x + plotSize / 2, y + plotSize / 2);
                }
            }
        } else if (plot.state === 'ready') {
            // Ready to harvest - golden yellow
            ctx.fillStyle = '#FFD700';
            drawRoundRect(x + 4, y + 4, plotSize - 8, plotSize - 8, borderRadius - 2);
            
            // Draw emoji and name
            if (plot.cropType) {
                if (plotSize > 40) {
                    ctx.font = `${Math.floor(plotSize * 0.4)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(plot.cropType.emoji, x + plotSize / 2, y + plotSize / 2 - plotSize * 0.1);
                    
                    // Draw crop name
                    ctx.font = `${Math.floor(plotSize * 0.12)}px Arial`;
                    ctx.fillStyle = '#000';
                    ctx.fillText(plot.cropType.name, x + plotSize / 2, y + plotSize / 2 + plotSize * 0.2);
                } else if (plotSize > 30) {
                    ctx.font = `${Math.floor(plotSize * 0.5)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(plot.cropType.emoji, x + plotSize / 2, y + plotSize / 2);
                }
            }
        }
        
        // Draw border
        ctx.strokeStyle = '#4a3f2a';
        ctx.lineWidth = 2;
        drawRoundRect(x, y, plotSize, plotSize, borderRadius, false);
    });
}

// Update game state
function updateGame() {
    const now = Date.now();
    const deltaTime = now - gameState.lastUpdate;
    gameState.lastUpdate = now;
    
    // Update all plots
    gameState.plots.forEach(plot => plot.update());
    
    // Auto-harvest if unlocked
    if (gameState.autoHarvestUnlocked) {
        if (now - gameState.lastAutoHarvest >= gameState.autoHarvestSpeed / Math.max(1, gameState.harvesterLevel)) {
            autoHarvest();
            gameState.lastAutoHarvest = now;
        }
    }
    
    // Auto-plant if planter is unlocked
    if (gameState.autoPlantUnlocked) {
        if (now - gameState.lastAutoPlant >= gameState.autoPlantSpeed / Math.max(1, gameState.planterLevel)) {
            autoPlant();
            gameState.lastAutoPlant = now;
        }
    }
    
    // Update UI
    updateUI();
    drawFarm();
}

function autoHarvest() {
    let totalEarnings = 0;
    gameState.plots.forEach(plot => {
        if (plot.state === 'ready') {
            totalEarnings += plot.harvest();
        }
    });
    if (totalEarnings > 0) {
        gameState.money += totalEarnings;
    }
}

function autoPlant() {
    gameState.plots.forEach(plot => {
        if (plot.state === 'empty') {
            plot.plant(gameState.selectedCropIndex);
        }
    });
}

// Manual harvest
function manualHarvest() {
    let totalEarnings = 0;
    gameState.plots.forEach(plot => {
        totalEarnings += plot.harvest();
    });
    if (totalEarnings > 0) {
        gameState.money += totalEarnings;
        // Don't auto-replant - player must plant manually or use auto-planter
    }
}

// Replant all plots with their last crop
function replantAll() {
    let plantsPlanted = 0;
    gameState.plots.forEach(plot => {
        if (plot.state === 'empty' && plot.lastCropIndex >= 0) {
            if (plot.plant(plot.lastCropIndex)) {
                plantsPlanted++;
            }
        }
    });
    updateUI();
    return plantsPlanted;
}

// Update UI
function updateUI() {
    document.getElementById('money').textContent = `$${Math.floor(gameState.money)}`;
    document.getElementById('farm-size').textContent = `${gameState.farmWidth}x${gameState.farmHeight}`;
    
    // Show automation status
    const automationStatus = [];
    if (gameState.autoHarvestUnlocked) automationStatus.push('🚜 Auto-Harvest');
    if (gameState.autoPlantUnlocked) automationStatus.push('🤖 Auto-Plant');
    const automationEl = document.getElementById('automation-status');
    if (automationEl) {
        automationEl.textContent = automationStatus.length > 0 ? automationStatus.join(' | ') : '';
    }
    
    // Calculate income rate based on current crops
    let avgCropValue = 0;
    let cropCount = 0;
    gameState.plots.forEach(plot => {
        if (plot.cropType) {
            avgCropValue += plot.cropType.baseValue;
            cropCount++;
        }
    });
    if (cropCount > 0) avgCropValue /= cropCount;
    else avgCropValue = cropTypes[gameState.selectedCropIndex].baseValue;
    
    const cyclesPerSecond = 1000 / (getCropGrowthTime() + 500);
    const incomeRate = gameState.plots.length * avgCropValue * cyclesPerSecond * (gameState.harvesterLevel > 0 ? 1 : 0.5);
    document.getElementById('income-rate').textContent = `$${incomeRate.toFixed(2)}`;
    
    // Update upgrade costs
    document.getElementById('cost-property').textContent = gameState.propertyCost;
    
    // Enable/disable buttons based on money
    const propertyBtn = document.getElementById('upgrade-property');
    if (propertyBtn) propertyBtn.disabled = gameState.money < gameState.propertyCost;
}

// Show seed shop modal
function showSeedShop() {
    const modal = document.getElementById('seed-shop-modal');
    const seedList = document.getElementById('seed-shop-list');
    seedList.innerHTML = '';
    
    cropTypes.forEach((crop, index) => {
        if (crop.unlocked) return; // Already unlocked
        
        const button = document.createElement('button');
        button.className = 'seed-shop-btn';
        button.innerHTML = `
            <div class="seed-shop-emoji">${crop.emoji}</div>
            <div class="seed-shop-name">${crop.name}</div>
            <div class="seed-shop-info">Value: $${crop.baseValue} | Plant: $${crop.plantCost}</div>
            <div class="seed-shop-cost">Unlock: $${crop.unlockCost}</div>
        `;
        button.disabled = gameState.money < crop.unlockCost;
        button.onclick = () => {
            if (gameState.money >= crop.unlockCost) {
                gameState.money -= crop.unlockCost;
                crop.unlocked = true;
                updateUI();
                showSeedShop(); // Refresh the shop
            }
        };
        seedList.appendChild(button);
    });
    
    if (seedList.children.length === 0) {
        seedList.innerHTML = '<p style="text-align: center; padding: 20px;">All crops unlocked! 🎉</p>';
    }
    
    modal.style.display = 'flex';
}

// Show automation upgrades modal
function showAutomationUpgrades() {
    const modal = document.getElementById('automation-modal');
    const upgradeList = document.getElementById('automation-list');
    upgradeList.innerHTML = '';
    
    // Auto-Harvest upgrade
    if (!gameState.autoHarvestUnlocked) {
        const autoHarvestBtn = document.createElement('button');
        autoHarvestBtn.className = 'growth-upgrade-btn';
        autoHarvestBtn.innerHTML = `
            <div class="upgrade-name">🚜 Auto-Harvest</div>
            <div class="upgrade-desc">Automatically harvest ready crops</div>
            <div class="upgrade-cost">Cost: $${gameState.autoHarvestCost}</div>
        `;
        autoHarvestBtn.disabled = gameState.money < gameState.autoHarvestCost;
        autoHarvestBtn.onclick = () => {
            if (gameState.money >= gameState.autoHarvestCost) {
                gameState.money -= gameState.autoHarvestCost;
                gameState.autoHarvestUnlocked = true;
                gameState.harvesterLevel = 1;
                updateUI();
                showAutomationUpgrades();
            }
        };
        upgradeList.appendChild(autoHarvestBtn);
    }
    
    // Auto-planter upgrade
    if (!gameState.autoPlantUnlocked) {
        const autoPlantBtn = document.createElement('button');
        autoPlantBtn.className = 'growth-upgrade-btn';
        autoPlantBtn.innerHTML = `
            <div class="upgrade-name">🤖 Auto-Planter</div>
            <div class="upgrade-desc">Automatically plant selected crop</div>
            <div class="upgrade-cost">Cost: $${gameState.autoPlantCost}</div>
        `;
        autoPlantBtn.disabled = gameState.money < gameState.autoPlantCost;
        autoPlantBtn.onclick = () => {
            if (gameState.money >= gameState.autoPlantCost) {
                gameState.money -= gameState.autoPlantCost;
                gameState.autoPlantUnlocked = true;
                gameState.planterLevel = 1;
                updateUI();
                showAutomationUpgrades();
            }
        };
        upgradeList.appendChild(autoPlantBtn);
    }
    
    if (upgradeList.children.length === 0) {
        upgradeList.innerHTML = '<p style="text-align: center; padding: 20px;">All automation unlocked! 🎉</p>';
    }
    
    modal.style.display = 'flex';
}

// Show growth upgrades modal
function showGrowthUpgrades() {
    const modal = document.getElementById('growth-upgrades-modal');
    const upgradeList = document.getElementById('growth-upgrades-list');
    upgradeList.innerHTML = '';
    
    // Fertilizer upgrade
    const fertBtn = document.createElement('button');
    fertBtn.className = 'growth-upgrade-btn';
    fertBtn.innerHTML = `
        <div class="upgrade-name">🌱 Better Fertilizer (Lv ${gameState.fertilizerLevel})</div>
        <div class="upgrade-desc">Reduce growth time by 15%</div>
        <div class="upgrade-cost">Cost: $${gameState.fertilizerCost}</div>
    `;
    fertBtn.disabled = gameState.money < gameState.fertilizerCost;
    fertBtn.onclick = () => {
        if (gameState.money >= gameState.fertilizerCost) {
            gameState.money -= gameState.fertilizerCost;
            gameState.fertilizerLevel++;
            gameState.fertilizerCost = Math.floor(gameState.fertilizerCost * 2);
            updateUI();
            showGrowthUpgrades();
        }
    };
    upgradeList.appendChild(fertBtn);
    
    // Soil upgrade
    const soilBtn = document.createElement('button');
    soilBtn.className = 'growth-upgrade-btn';
    soilBtn.innerHTML = `
        <div class="upgrade-name">🪴 Soil Amendments (Lv ${gameState.soilLevel})</div>
        <div class="upgrade-desc">Reduce growth time by 15%</div>
        <div class="upgrade-cost">Cost: $${gameState.soilCost}</div>
    `;
    soilBtn.disabled = gameState.money < gameState.soilCost;
    soilBtn.onclick = () => {
        if (gameState.money >= gameState.soilCost) {
            gameState.money -= gameState.soilCost;
            gameState.soilLevel++;
            gameState.soilCost = Math.floor(gameState.soilCost * 2.2);
            updateUI();
            showGrowthUpgrades();
        }
    };
    upgradeList.appendChild(soilBtn);
    
    // Irrigation upgrade
    const irrigBtn = document.createElement('button');
    irrigBtn.className = 'growth-upgrade-btn';
    irrigBtn.innerHTML = `
        <div class="upgrade-name">💧 Irrigation System (Lv ${gameState.irrigationLevel})</div>
        <div class="upgrade-desc">Reduce growth time by 15%</div>
        <div class="upgrade-cost">Cost: $${gameState.irrigationCost}</div>
    `;
    irrigBtn.disabled = gameState.money < gameState.irrigationCost;
    irrigBtn.onclick = () => {
        if (gameState.money >= gameState.irrigationCost) {
            gameState.money -= gameState.irrigationCost;
            gameState.irrigationLevel++;
            gameState.irrigationCost = Math.floor(gameState.irrigationCost * 2.5);
            updateUI();
            showGrowthUpgrades();
        }
    };
    upgradeList.appendChild(irrigBtn);
    
    modal.style.display = 'flex';
}

// Show property expansion modal
function showPropertyExpansion() {
    const modal = document.getElementById('property-modal');
    const content = document.getElementById('property-content');
    
    const nextLevel = gameState.propertyLevel + 1;
    const isWidth = nextLevel % 2 === 0;
    const newDimension = isWidth ? gameState.farmWidth + 1 : gameState.farmHeight + 1;
    const currentPlots = gameState.farmWidth * gameState.farmHeight;
    const newPlots = isWidth ? newDimension * gameState.farmHeight : gameState.farmWidth * newDimension;
    const addedPlots = newPlots - currentPlots;
    
    content.innerHTML = `
        <h3>Expand Property</h3>
        <div class="property-info">
            <p><strong>Current Size:</strong> ${gameState.farmWidth}x${gameState.farmHeight} (${currentPlots} plots)</p>
            <p><strong>New Size:</strong> ${isWidth ? newDimension : gameState.farmWidth}x${isWidth ? gameState.farmHeight : newDimension} (${newPlots} plots)</p>
            <p><strong>Plots Added:</strong> +${addedPlots} plots</p>
            <p class="property-cost"><strong>Cost: $${gameState.propertyCost}</strong></p>
        </div>
        <button id="confirm-property" class="growth-upgrade-btn" ${gameState.money < gameState.propertyCost ? 'disabled' : ''}>
            <div class="upgrade-name">✅ Confirm Purchase</div>
        </button>
    `;
    
    document.getElementById('confirm-property').onclick = () => {
        if (gameState.money >= gameState.propertyCost) {
            gameState.money -= gameState.propertyCost;
            gameState.propertyLevel++;
            
            // Expand farm (alternate between width and height)
            if (gameState.propertyLevel % 2 === 0) {
                gameState.farmWidth++;
            } else {
                gameState.farmHeight++;
            }
            
            // Add new plots
            initializeFarm();
            
            gameState.propertyCost = Math.floor(gameState.propertyCost * 1.5);
            modal.style.display = 'none';
            updateUI();
        }
    };
    
    modal.style.display = 'flex';
}

// Upgrade handlers
function buyUpgrade(upgradeType) {
    switch(upgradeType) {
        case 'property':
            showPropertyExpansion();
            break;
            
        case 'seeds':
            showSeedShop();
            break;
            
        case 'growth':
            showGrowthUpgrades();
            break;
            
        case 'automation':
            showAutomationUpgrades();
            break;
    }
    
    updateUI();
}

// Event listeners
document.querySelectorAll('.upgrade-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const upgradeType = e.currentTarget.dataset.upgrade;
        buyUpgrade(upgradeType);
    });
});

document.getElementById('manual-harvest').addEventListener('click', manualHarvest);

document.getElementById('replant-all').addEventListener('click', replantAll);

// Canvas click handler for individual plots
let selectedPlotForPlanting = null;

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const spacing = 4;
    const plotSize = Math.min(
        (canvas.width - 40) / gameState.farmWidth - spacing,
        (canvas.height - 40) / gameState.farmHeight - spacing
    );
    
    const totalWidth = gameState.farmWidth * (plotSize + spacing) - spacing;
    const totalHeight = gameState.farmHeight * (plotSize + spacing) - spacing;
    const offsetX = (canvas.width - totalWidth) / 2;
    const offsetY = (canvas.height - totalHeight) / 2;
    
    // Find which plot was clicked
    gameState.plots.forEach(plot => {
        const x = offsetX + plot.x * (plotSize + spacing);
        const y = offsetY + plot.y * (plotSize + spacing);
        
        if (clickX >= x && clickX <= x + plotSize &&
            clickY >= y && clickY <= y + plotSize) {
            
            if (plot.state === 'ready') {
                // Harvest the plot
                const earnings = plot.harvest();
                gameState.money += earnings;
                updateUI();
            } else if (plot.state === 'empty') {
                // Show crop selection sidebar at cursor position
                selectedPlotForPlanting = plot;
                showCropSelector(e.clientX, e.clientY);
            }
        }
    });
});

// Show crop selection sidebar at cursor position
function showCropSelector(mouseX, mouseY) {
    const sidebar = document.getElementById('crop-selector');
    const cropList = document.getElementById('crop-selector-list');
    cropList.innerHTML = '';
    
    cropTypes.forEach((crop, index) => {
        if (!crop.unlocked) return;
        
        const button = document.createElement('button');
        button.className = 'crop-selector-btn';
        button.innerHTML = `
            <span class="crop-selector-emoji">${crop.emoji}</span>
            <span class="crop-selector-name">${crop.name}</span>
            <span class="crop-selector-cost">$${crop.plantCost}</span>
        `;
        button.disabled = gameState.money < crop.plantCost;
        button.onclick = () => {
            if (selectedPlotForPlanting && selectedPlotForPlanting.plant(index)) {
                gameState.selectedCropIndex = index;
                sidebar.classList.remove('visible');
                updateUI();
            }
        };
        cropList.appendChild(button);
    });
    
    // Position the selector near the cursor
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const selectorWidth = 220; // Approximate width
    const selectorHeight = cropList.children.length * 60 + 80; // Approximate height
    
    // Calculate position (prefer right and below cursor, adjust if off-screen)
    let left = mouseX + 10;
    let top = mouseY + 10;
    
    // Adjust if it would go off right edge
    if (left + selectorWidth > viewportWidth) {
        left = mouseX - selectorWidth - 10;
    }
    
    // Adjust if it would go off bottom edge
    if (top + selectorHeight > viewportHeight) {
        top = mouseY - selectorHeight - 10;
    }
    
    // Ensure it doesn't go off left or top edge
    left = Math.max(10, left);
    top = Math.max(10, top);
    
    sidebar.style.left = `${left}px`;
    sidebar.style.top = `${top}px`;
    sidebar.classList.add('visible');
}

// Close crop selector when clicking outside
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('crop-selector');
    const canvas = document.getElementById('farm-canvas');
    if (sidebar.classList.contains('visible') && 
        !sidebar.contains(e.target) && 
        e.target !== canvas) {
        sidebar.classList.remove('visible');
    }
});

// Game loop
function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);
}

// Initialize and start
initializeFarm();
updateUI();
drawFarm();
gameLoop();
