// Game State
const gameState = {
    money: 0,
    farmWidth: 3,
    farmHeight: 3,
    plots: [],
    
    // Upgrade levels
    propertyLevel: 1,
    harvesterLevel: 0,
    planterLevel: 0,
    cropLevel: 1,
    
    // Upgrade costs
    propertyCost: 100,
    harvesterCost: 50,
    planterCost: 75,
    cropCost: 200,
    
    // Game mechanics
    cropGrowthTime: 5000, // ms
    harvestValue: 10,
    autoHarvestSpeed: 1000, // ms between auto harvests
    autoPlantSpeed: 1500, // ms between auto plants
    
    lastUpdate: Date.now(),
    lastAutoHarvest: Date.now(),
    lastAutoPlant: Date.now()
};

// Plot states: 'empty', 'growing', 'ready'
class Plot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = 'empty';
        this.plantTime = null;
        this.cropType = 'wheat';
    }
    
    plant() {
        if (this.state === 'empty') {
            this.state = 'growing';
            this.plantTime = Date.now();
            return true;
        }
        return false;
    }
    
    update() {
        if (this.state === 'growing') {
            const elapsed = Date.now() - this.plantTime;
            if (elapsed >= gameState.cropGrowthTime) {
                this.state = 'ready';
            }
        }
    }
    
    harvest() {
        if (this.state === 'ready') {
            this.state = 'empty';
            this.plantTime = null;
            return gameState.harvestValue * gameState.cropLevel;
        }
        return 0;
    }
    
    getGrowthProgress() {
        if (this.state !== 'growing') return 0;
        const elapsed = Date.now() - this.plantTime;
        return Math.min(elapsed / gameState.cropGrowthTime, 1);
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
    
    // Plant initial crops
    gameState.plots.forEach(plot => plot.plant());
}

// Canvas rendering
const canvas = document.getElementById('farm-canvas');
const ctx = canvas.getContext('2d');

function drawFarm() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const plotSize = Math.min(
        (canvas.width - 40) / gameState.farmWidth,
        (canvas.height - 40) / gameState.farmHeight
    );
    
    const offsetX = (canvas.width - (plotSize * gameState.farmWidth)) / 2;
    const offsetY = (canvas.height - (plotSize * gameState.farmHeight)) / 2;
    
    gameState.plots.forEach(plot => {
        const x = offsetX + plot.x * plotSize;
        const y = offsetY + plot.y * plotSize;
        
        // Draw plot background
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, plotSize - 2, plotSize - 2);
        
        // Draw crop state
        if (plot.state === 'empty') {
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + 4, y + 4, plotSize - 10, plotSize - 10);
        } else if (plot.state === 'growing') {
            const progress = plot.getGrowthProgress();
            // Growing crop - shade of green based on progress
            const greenValue = Math.floor(100 + (progress * 155));
            ctx.fillStyle = `rgb(50, ${greenValue}, 50)`;
            ctx.fillRect(x + 4, y + 4, plotSize - 10, plotSize - 10);
            
            // Draw small sprout
            ctx.fillStyle = `rgb(34, ${Math.floor(139 * progress)}, 34)`;
            const sproutSize = (plotSize - 10) * progress * 0.6;
            ctx.fillRect(
                x + (plotSize - sproutSize) / 2,
                y + (plotSize - sproutSize) / 2,
                sproutSize,
                sproutSize
            );
        } else if (plot.state === 'ready') {
            // Ready to harvest - golden yellow
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 4, y + 4, plotSize - 10, plotSize - 10);
            
            // Draw wheat stalks
            ctx.fillStyle = '#FFA500';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(
                    x + 8 + i * (plotSize - 16) / 3,
                    y + 6,
                    3,
                    plotSize - 12
                );
            }
        }
        
        // Draw border
        ctx.strokeStyle = '#4a3f2a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, plotSize - 2, plotSize - 2);
    });
}

// Update game state
function updateGame() {
    const now = Date.now();
    const deltaTime = now - gameState.lastUpdate;
    gameState.lastUpdate = now;
    
    // Update all plots
    gameState.plots.forEach(plot => plot.update());
    
    // Auto-harvest if harvester is unlocked
    if (gameState.harvesterLevel > 0) {
        if (now - gameState.lastAutoHarvest >= gameState.autoHarvestSpeed / gameState.harvesterLevel) {
            autoHarvest();
            gameState.lastAutoHarvest = now;
        }
    }
    
    // Auto-plant if planter is unlocked
    if (gameState.planterLevel > 0) {
        if (now - gameState.lastAutoPlant >= gameState.autoPlantSpeed / gameState.planterLevel) {
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
            plot.plant();
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
        // Auto-replant after manual harvest
        gameState.plots.forEach(plot => {
            if (plot.state === 'empty') {
                plot.plant();
            }
        });
    }
}

// Update UI
function updateUI() {
    document.getElementById('money').textContent = `$${Math.floor(gameState.money)}`;
    document.getElementById('farm-size').textContent = `${gameState.farmWidth}x${gameState.farmHeight}`;
    
    // Calculate income rate
    const readyPlots = gameState.plots.filter(p => p.state === 'ready').length;
    const growingPlots = gameState.plots.filter(p => p.state === 'growing').length;
    const incomePerCycle = gameState.plots.length * gameState.harvestValue * gameState.cropLevel;
    const cyclesPerSecond = 1000 / (gameState.cropGrowthTime + 500);
    const incomeRate = incomePerCycle * cyclesPerSecond * (gameState.harvesterLevel > 0 ? 1 : 0.5);
    document.getElementById('income-rate').textContent = `$${incomeRate.toFixed(2)}`;
    
    // Update upgrade costs
    document.getElementById('cost-property').textContent = gameState.propertyCost;
    document.getElementById('cost-harvester').textContent = gameState.harvesterCost;
    document.getElementById('cost-planter').textContent = gameState.planterCost;
    document.getElementById('cost-crop').textContent = gameState.cropCost;
    
    // Enable/disable buttons based on money
    document.getElementById('upgrade-property').disabled = gameState.money < gameState.propertyCost;
    document.getElementById('upgrade-harvester').disabled = gameState.money < gameState.harvesterCost;
    document.getElementById('upgrade-planter').disabled = gameState.money < gameState.planterCost;
    document.getElementById('upgrade-crop').disabled = gameState.money < gameState.cropCost;
}

// Upgrade handlers
function buyUpgrade(upgradeType) {
    switch(upgradeType) {
        case 'property':
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
            }
            break;
            
        case 'harvester':
            if (gameState.money >= gameState.harvesterCost) {
                gameState.money -= gameState.harvesterCost;
                gameState.harvesterLevel++;
                gameState.harvesterCost = Math.floor(gameState.harvesterCost * 1.8);
            }
            break;
            
        case 'planter':
            if (gameState.money >= gameState.planterCost) {
                gameState.money -= gameState.planterCost;
                gameState.planterLevel++;
                gameState.planterCost = Math.floor(gameState.planterCost * 1.8);
            }
            break;
            
        case 'crop':
            if (gameState.money >= gameState.cropCost) {
                gameState.money -= gameState.cropCost;
                gameState.cropLevel++;
                gameState.cropCost = Math.floor(gameState.cropCost * 2);
            }
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
