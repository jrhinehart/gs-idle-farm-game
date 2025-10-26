# Idle Farm Game - AI Coding Instructions

## Architecture Overview

This is a **zero-dependency, single-page idle farming game** built with vanilla JavaScript, HTML5 Canvas, and CSS. All code is self-contained in three files: `index.html`, `style.css`, and `game.js`. The game must remain embeddable via iframe with no external dependencies.

## Core Game Loop Architecture

The game uses `requestAnimationFrame` for the main loop (see `gameLoop()` in `game.js`), which:
1. Updates all plot states (`plot.update()`)
2. Triggers auto-harvest if `harvesterLevel > 0` (speed: `autoHarvestSpeed / harvesterLevel`)
3. Triggers auto-plant if `planterLevel > 0` (speed: `autoPlantSpeed / planterLevel`)
4. Updates UI and redraws canvas

**Critical**: All timing uses `Date.now()` deltas, not frame counts. This ensures consistent game speed across different refresh rates.

## State Management Pattern

All game state lives in the `gameState` object at the top of `game.js`. Never create global variables outside this object. The `Plot` class manages individual plot lifecycle (empty → growing → ready), but farm-wide state stays in `gameState`.

**Plot state machine**: 
- `empty` → `plant()` → `growing` (tracks `plantTime`)
- `growing` → auto-updates to `ready` when `Date.now() - plantTime >= cropGrowthTime`
- `ready` → `harvest()` → `empty` (returns money)

## Canvas Rendering Conventions

The `drawFarm()` function dynamically sizes plots based on canvas dimensions and `farmWidth/farmHeight`:
- Plot size: `Math.min((canvas.width - 40) / farmWidth, (canvas.height - 40) / farmHeight)`
- Centering offsets ensure farm stays centered when grid size changes
- Visual state encoding: brown (#8B4513) for soil, progressive green (based on `getGrowthProgress()`) for growing, golden (#FFD700) for ready

**Never hardcode pixel positions** - all rendering must adapt to dynamic farm sizes.

## Upgrade Scaling Formula

All upgrades use exponential cost scaling to maintain idle game progression:
- Property: `cost * 1.5` (alternates width/height expansion)
- Harvester/Planter: `cost * 1.8` (speed multipliers)
- Crops: `cost * 2` (value multiplier applied to `harvestValue * cropLevel`)

When adding upgrades, follow this pattern in `buyUpgrade()` - deduct cost, increment level, update cost, call `initializeFarm()` if farm size changed.

## Development Workflow

**No build process exists**. Open `index.html` directly in a browser (use Live Server or `python -m http.server` for local testing).

For debugging:
- Add `console.log()` in `updateGame()` to track state changes
- Inspect `gameState` object in browser console
- Use browser DevTools to slow down `requestAnimationFrame` for timing issues

## Key Conventions

1. **Auto-replanting**: Manual harvest always replants (`manualHarvest()` calls `plot.plant()` after harvesting). Auto-planter is a separate upgrade for idle gameplay.
2. **Income calculation**: The income rate display in UI is approximate (`incomeRate.toFixed(2)`), factoring in growth time and automation levels - it's informational, not used in actual money calculations.
3. **UI updates**: Always call `updateUI()` after state changes. It handles money display, button enabling/disabling, and stat updates.
4. **Grid expansion**: Farm grows by adding rows/columns, then `initializeFarm()` recreates the entire plot array - existing plots are lost (intentional design).

## Adding New Features

When adding crops/mechanics:
- Add properties to `gameState` at the top
- Update `Plot.update()` for new growth behavior
- Modify `drawFarm()` for new visual states
- Add upgrade button in `index.html` with `data-upgrade` attribute
- Handle in `buyUpgrade()` switch statement
- Update `updateUI()` to reflect new stats

Example: Adding seasons would require a `gameState.currentSeason` property, new logic in `Plot.update()` for seasonal growth rates, and visual changes in `drawFarm()` (different colors/backgrounds).
