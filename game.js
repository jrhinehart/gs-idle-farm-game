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
    autoHarvestEnabled: false, // Toggle state for auto-harvest
    
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

// Draw simple crop icons directly on canvas
function drawCropIcon(ctx, cropName, x, y, size) {
    ctx.save();
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    switch(cropName) {
        case 'Wheat':
            // Wheat stalks
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = size * 0.05;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - size * 0.3);
            ctx.lineTo(centerX, centerY + size * 0.3);
            ctx.stroke();
            // Grain dots
            ctx.fillStyle = '#F4A460';
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.arc(centerX - size * 0.15, centerY - size * 0.2 + i * size * 0.1, size * 0.04, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX + size * 0.15, centerY - size * 0.2 + i * size * 0.1, size * 0.04, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
            
        case 'Corn':
            // Corn body
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, size * 0.2, size * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            // Kernels
            ctx.fillStyle = '#DAA520';
            for (let row = -2; row <= 2; row++) {
                for (let col = -1; col <= 1; col++) {
                    ctx.beginPath();
                    ctx.arc(centerX + col * size * 0.12, centerY + row * size * 0.12, size * 0.04, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            // Husk
            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = size * 0.08;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - size * 0.35);
            ctx.lineTo(centerX - size * 0.15, centerY - size * 0.45);
            ctx.moveTo(centerX, centerY - size * 0.35);
            ctx.lineTo(centerX + size * 0.15, centerY - size * 0.45);
            ctx.stroke();
            break;
            
        case 'Apple':
            // Apple body
            ctx.fillStyle = '#DC143C';
            ctx.beginPath();
            ctx.arc(centerX, centerY + size * 0.05, size * 0.25, 0, Math.PI * 2);
            ctx.fill();
            // Highlight
            ctx.fillStyle = 'rgba(255, 107, 107, 0.5)';
            ctx.beginPath();
            ctx.arc(centerX - size * 0.08, centerY - size * 0.02, size * 0.12, 0, Math.PI * 2);
            ctx.fill();
            // Stem
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = size * 0.06;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - size * 0.2);
            ctx.lineTo(centerX + size * 0.05, centerY - size * 0.35);
            ctx.stroke();
            // Leaf
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.ellipse(centerX + size * 0.15, centerY - size * 0.3, size * 0.08, size * 0.12, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'Eggplant':
            // Eggplant body
            ctx.fillStyle = '#4B0082';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + size * 0.1, size * 0.2, size * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            // Highlight
            ctx.fillStyle = 'rgba(147, 112, 219, 0.4)';
            ctx.beginPath();
            ctx.ellipse(centerX - size * 0.05, centerY, size * 0.06, size * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            // Stem/cap
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY - size * 0.2, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'Squash':
            // Pumpkin body
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.arc(centerX, centerY, size * 0.28, 0, Math.PI * 2);
            ctx.fill();
            // Ridges
            ctx.strokeStyle = '#D2691E';
            ctx.lineWidth = size * 0.04;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + Math.cos(angle) * size * 0.28, centerY + Math.sin(angle) * size * 0.28);
                ctx.stroke();
            }
            // Stem
            ctx.fillStyle = '#228B22';
            ctx.fillRect(centerX - size * 0.05, centerY - size * 0.35, size * 0.1, size * 0.15);
            break;
            
        case 'Garlic':
            // Garlic bulb
            ctx.fillStyle = '#F5F5DC';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + size * 0.05, size * 0.22, size * 0.28, 0, 0, Math.PI * 2);
            ctx.fill();
            // Segments
            ctx.strokeStyle = '#DEB887';
            ctx.lineWidth = size * 0.04;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - size * 0.23);
            ctx.lineTo(centerX, centerY + size * 0.33);
            ctx.moveTo(centerX - size * 0.15, centerY - size * 0.1);
            ctx.lineTo(centerX - size * 0.15, centerY + size * 0.25);
            ctx.moveTo(centerX + size * 0.15, centerY - size * 0.1);
            ctx.lineTo(centerX + size * 0.15, centerY + size * 0.25);
            ctx.stroke();
            // Sprout
            ctx.strokeStyle = '#90EE90';
            ctx.lineWidth = size * 0.06;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - size * 0.23);
            ctx.quadraticCurveTo(centerX + size * 0.1, centerY - size * 0.35, centerX + size * 0.05, centerY - size * 0.4);
            ctx.stroke();
            ctx.fillStyle = '#90EE90';
            ctx.beginPath();
            ctx.arc(centerX, centerY - size * 0.28, size * 0.03, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
    
    ctx.restore();
}

// Crop types - ordered by progression
const cropTypes = [
    { name: 'Wheat', baseValue: 10, unlockCost: 0, unlocked: true, plantCost: 2 },
    { name: 'Corn', baseValue: 25, unlockCost: 125, unlocked: false, plantCost: 5 },
    { name: 'Apple', baseValue: 60, unlockCost: 300, unlocked: false, plantCost: 12 },
    { name: 'Eggplant', baseValue: 150, unlockCost: 750, unlocked: false, plantCost: 30 },
    { name: 'Squash', baseValue: 375, unlockCost: 1875, unlocked: false, plantCost: 75 },
    { name: 'Garlic', baseValue: 950, unlockCost: 4750, unlocked: false, plantCost: 190 }
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
        this.autoPlantEnabled = false; // Per-plot auto-plant toggle
        this.queuedCropIndex = null; // Crop queued for next cycle
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
            
            // If there's a queued crop, plant it immediately
            if (this.queuedCropIndex !== null) {
                this.plant(this.queuedCropIndex);
                this.queuedCropIndex = null;
            }
            
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
    // Save existing plots data
    const oldPlots = gameState.plots || [];
    const oldPlotsMap = new Map();
    
    oldPlots.forEach(plot => {
        const key = `${plot.x},${plot.y}`;
        oldPlotsMap.set(key, plot);
    });
    
    // Create new plot grid
    gameState.plots = [];
    for (let y = 0; y < gameState.farmHeight; y++) {
        for (let x = 0; x < gameState.farmWidth; x++) {
            const key = `${x},${y}`;
            
            // Restore existing plot if it exists, otherwise create new empty plot
            if (oldPlotsMap.has(key)) {
                const existingPlot = oldPlotsMap.get(key);
                gameState.plots.push(existingPlot);
            } else {
                gameState.plots.push(new Plot(x, y));
            }
        }
    }
    
    // Don't auto-plant initial crops - player must plant manually or buy auto-planter
}

// Canvas rendering
const canvas = document.getElementById('farm-canvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit container
function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width - 40; // Account for padding
    canvas.height = rect.height - 40;
    drawFarm(); // Redraw after resize
}

// Call resize on load and window resize
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);

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
                    const iconSize = Math.floor(plotSize * 0.3);
                    ctx.globalAlpha = 0.3;
                    drawCropIcon(ctx, lastCrop.name, x + (plotSize - iconSize) / 2, y + (plotSize - iconSize) / 2, iconSize);
                    ctx.globalAlpha = 1.0;
                }
            }
        } else if (plot.state === 'growing') {
            const progress = plot.getGrowthProgress();
            // Growing crop - shade of green based on progress
            const greenValue = Math.floor(100 + (progress * 155));
            ctx.fillStyle = `rgb(50, ${greenValue}, 50)`;
            drawRoundRect(x + 4, y + 4, plotSize - 8, plotSize - 8, borderRadius - 2);
            
            // Draw crop icon and name if plot is large enough
            if (plot.cropType) {
                if (plotSize > 40) {
                    const iconSize = Math.floor(plotSize * 0.35);
                    drawCropIcon(ctx, plot.cropType.name, x + (plotSize - iconSize) / 2, y + plotSize / 2 - iconSize / 2 - plotSize * 0.1, iconSize);
                    
                    // Draw crop name
                    ctx.font = `${Math.floor(plotSize * 0.12)}px Arial`;
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(plot.cropType.name, x + plotSize / 2, y + plotSize / 2 + plotSize * 0.2);
                } else if (plotSize > 30) {
                    const iconSize = Math.floor(plotSize * 0.4);
                    drawCropIcon(ctx, plot.cropType.name, x + (plotSize - iconSize) / 2, y + (plotSize - iconSize) / 2, iconSize);
                }
            }
        } else if (plot.state === 'ready') {
            // Ready to harvest - golden yellow
            ctx.fillStyle = '#FFD700';
            drawRoundRect(x + 4, y + 4, plotSize - 8, plotSize - 8, borderRadius - 2);
            
            // Draw crop icon and name
            if (plot.cropType) {
                if (plotSize > 40) {
                    const iconSize = Math.floor(plotSize * 0.4);
                    drawCropIcon(ctx, plot.cropType.name, x + (plotSize - iconSize) / 2, y + plotSize / 2 - iconSize / 2 - plotSize * 0.1, iconSize);
                    
                    // Draw crop name
                    ctx.font = `${Math.floor(plotSize * 0.12)}px Arial`;
                    ctx.fillStyle = '#000';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(plot.cropType.name, x + plotSize / 2, y + plotSize / 2 + plotSize * 0.2);
                } else if (plotSize > 30) {
                    const iconSize = Math.floor(plotSize * 0.5);
                    drawCropIcon(ctx, plot.cropType.name, x + (plotSize - iconSize) / 2, y + (plotSize - iconSize) / 2, iconSize);
                }
            }
        }
        
        // Draw border
        ctx.strokeStyle = '#4a3f2a';
        ctx.lineWidth = 2;
        drawRoundRect(x, y, plotSize, plotSize, borderRadius, false);
        
        // Draw auto-plant toggle button in top-right corner if auto-planter is unlocked
        if (gameState.autoPlantUnlocked && plotSize > 50) {
            const btnSize = Math.min(plotSize * 0.2, 20);
            const btnX = x + plotSize - btnSize - 4;
            const btnY = y + 4;
            
            // Button background
            ctx.fillStyle = plot.autoPlantEnabled ? '#4CAF50' : '#757575';
            ctx.beginPath();
            ctx.arc(btnX + btnSize/2, btnY + btnSize/2, btnSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // "A" text for auto-plant
            ctx.fillStyle = 'white';
            ctx.font = `bold ${Math.floor(btnSize * 0.7)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('A', btnX + btnSize/2, btnY + btnSize/2);
            
            // Store button location for click detection
            plot.autoPlantBtnBounds = { x: btnX, y: btnY, size: btnSize };
        }
        
        // Draw crop change button in top-left corner for growing crops
        if (plot.state === 'growing' && plotSize > 50) {
            const btnSize = Math.min(plotSize * 0.2, 20);
            const btnX = x + 4;
            const btnY = y + 4;
            
            // Button background
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.arc(btnX + btnSize/2, btnY + btnSize/2, btnSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // "C" text for change crop
            ctx.fillStyle = 'white';
            ctx.font = `bold ${Math.floor(btnSize * 0.7)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('C', btnX + btnSize/2, btnY + btnSize/2);
            
            // Store button location for click detection
            plot.changeCropBtnBounds = { x: btnX, y: btnY, size: btnSize };
        } else {
            plot.changeCropBtnBounds = null;
        }
    });
}

// Update game state
function updateGame() {
    const now = Date.now();
    const deltaTime = now - gameState.lastUpdate;
    gameState.lastUpdate = now;
    
    // Update all plots
    gameState.plots.forEach(plot => plot.update());
    
    // Auto-harvest if unlocked and enabled
    if (gameState.autoHarvestUnlocked && gameState.autoHarvestEnabled) {
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
        if (plot.state === 'empty' && plot.autoPlantEnabled && plot.lastCropIndex >= 0) {
            plot.plant(plot.lastCropIndex);
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
    
    // Show automation status with clickable auto-harvest toggle
    const automationStatus = [];
    if (gameState.autoHarvestUnlocked) {
        const status = gameState.autoHarvestEnabled ? 'ON' : 'OFF';
        const statusClass = gameState.autoHarvestEnabled ? 'status-on' : 'status-off';
        automationStatus.push(`<span class="auto-toggle ${statusClass}" id="auto-harvest-toggle">Auto-Harvest: ${status}</span>`);
    }
    if (gameState.autoPlantUnlocked) {
        const autoPlantCount = gameState.plots.filter(p => p.autoPlantEnabled).length;
        automationStatus.push(`<span>Auto-Plant: ${autoPlantCount} plots</span>`);
    }
    const automationEl = document.getElementById('automation-status');
    if (automationEl) {
        automationEl.innerHTML = automationStatus.length > 0 ? automationStatus.join(' | ') : '';
        
        // Add click handler to auto-harvest toggle
        const autoHarvestToggle = document.getElementById('auto-harvest-toggle');
        if (autoHarvestToggle) {
            autoHarvestToggle.onclick = () => {
                gameState.autoHarvestEnabled = !gameState.autoHarvestEnabled;
                updateUI();
            };
            autoHarvestToggle.style.cursor = 'pointer';
        }
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
        
        // Create canvas for crop icon
        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 40;
        iconCanvas.height = 40;
        iconCanvas.className = 'seed-shop-icon';
        const iconCtx = iconCanvas.getContext('2d');
        drawCropIcon(iconCtx, crop.name, 0, 0, 40);
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'seed-shop-name';
        nameDiv.textContent = crop.name;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'seed-shop-info';
        infoDiv.textContent = `Value: $${crop.baseValue} | Plant: $${crop.plantCost}`;
        
        const costDiv = document.createElement('div');
        costDiv.className = 'seed-shop-cost';
        costDiv.textContent = `Unlock: $${crop.unlockCost}`;
        
        button.appendChild(iconCanvas);
        button.appendChild(nameDiv);
        button.appendChild(infoDiv);
        button.appendChild(costDiv);
        
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
        seedList.innerHTML = '<p style="text-align: center; padding: 20px;">All crops unlocked!</p>';
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
            <div class="upgrade-name">Auto-Harvest</div>
            <div class="upgrade-desc">Automatically harvest ready crops</div>
            <div class="upgrade-cost">Cost: $${gameState.autoHarvestCost}</div>
        `;
        autoHarvestBtn.disabled = gameState.money < gameState.autoHarvestCost;
        autoHarvestBtn.onclick = () => {
            if (gameState.money >= gameState.autoHarvestCost) {
                gameState.money -= gameState.autoHarvestCost;
                gameState.autoHarvestUnlocked = true;
                gameState.autoHarvestEnabled = true; // Enable by default
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
            <div class="upgrade-name">Auto-Planter</div>
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
        upgradeList.innerHTML = '<p style="text-align: center; padding: 20px;">All automation unlocked!</p>';
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
        <div class="upgrade-name">Better Fertilizer (Lv ${gameState.fertilizerLevel})</div>
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
        <div class="upgrade-name">Soil Amendments (Lv ${gameState.soilLevel})</div>
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
        <div class="upgrade-name">Irrigation System (Lv ${gameState.irrigationLevel})</div>
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
        
        // Check if auto-plant button was clicked
        if (plot.autoPlantBtnBounds && gameState.autoPlantUnlocked) {
            const btn = plot.autoPlantBtnBounds;
            const dx = clickX - (btn.x + btn.size/2);
            const dy = clickY - (btn.y + btn.size/2);
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance <= btn.size/2) {
                plot.autoPlantEnabled = !plot.autoPlantEnabled;
                updateUI();
                return;
            }
        }
        
        // Check if change crop button was clicked
        if (plot.changeCropBtnBounds && plot.state === 'growing') {
            const btn = plot.changeCropBtnBounds;
            const dx = clickX - (btn.x + btn.size/2);
            const dy = clickY - (btn.y + btn.size/2);
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance <= btn.size/2) {
                // Queue crop change for next cycle instead of interrupting
                selectedPlotForPlanting = plot;
                showCropSelectorForQueue(e.clientX, e.clientY, plot);
                return;
            }
        }
        
        // Check if plot body was clicked
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
        
        // Create small canvas for crop icon
        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 30;
        iconCanvas.height = 30;
        iconCanvas.className = 'crop-selector-icon';
        const iconCtx = iconCanvas.getContext('2d');
        drawCropIcon(iconCtx, crop.name, 0, 0, 30);
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'crop-selector-name';
        nameSpan.textContent = crop.name;
        
        const costSpan = document.createElement('span');
        costSpan.className = 'crop-selector-cost';
        costSpan.textContent = `$${crop.plantCost}`;
        
        button.appendChild(iconCanvas);
        button.appendChild(nameSpan);
        button.appendChild(costSpan);
        
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

// Show crop selection for queueing (when changing during growth)
function showCropSelectorForQueue(mouseX, mouseY, plot) {
    const sidebar = document.getElementById('crop-selector');
    const cropList = document.getElementById('crop-selector-list');
    cropList.innerHTML = '';
    
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '10px';
    header.style.fontSize = '0.85em';
    header.style.color = '#666';
    header.textContent = 'Queue for next cycle';
    cropList.appendChild(header);
    
    cropTypes.forEach((crop, index) => {
        if (!crop.unlocked) return;
        
        const button = document.createElement('button');
        button.className = 'crop-selector-btn';
        
        // Create small canvas for crop icon
        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 30;
        iconCanvas.height = 30;
        iconCanvas.className = 'crop-selector-icon';
        const iconCtx = iconCanvas.getContext('2d');
        drawCropIcon(iconCtx, crop.name, 0, 0, 30);
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'crop-selector-name';
        nameSpan.textContent = crop.name;
        
        const costSpan = document.createElement('span');
        costSpan.className = 'crop-selector-cost';
        costSpan.textContent = plot.queuedCropIndex === index ? '✓ Queued' : 'Queue';
        
        button.appendChild(iconCanvas);
        button.appendChild(nameSpan);
        button.appendChild(costSpan);
        
        if (plot.queuedCropIndex === index) {
            button.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        }
        
        button.onclick = () => {
            plot.queuedCropIndex = index;
            sidebar.classList.remove('visible');
            updateUI();
        };
        cropList.appendChild(button);
    });
    
    // Position the selector near the cursor
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const selectorWidth = 220;
    const selectorHeight = cropList.children.length * 60 + 100;
    
    let left = mouseX + 10;
    let top = mouseY + 10;
    
    if (left + selectorWidth > viewportWidth) {
        left = mouseX - selectorWidth - 10;
    }
    
    if (top + selectorHeight > viewportHeight) {
        top = mouseY - selectorHeight - 10;
    }
    
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
