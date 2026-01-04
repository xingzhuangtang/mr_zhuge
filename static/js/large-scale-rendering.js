/**
 * Large Scale Rendering System
 * Handles the creation, management, and visualization of mass units for battle replays.
 * Replaces the missing file to restore visualization functionality.
 */

// Global Unit Management
// battleArmies is defined in game-battle-replay.html: let battleArmies = {};

/**
 * Creates the deployment effect and initializes units on the map
 * @param {Object} event - The deployment event data
 */
function createDeploymentEffect(event) {
    console.log("🚀 Initializing Deployment...", event);

    // Clear existing units if any (safety check)
    if (Object.keys(battleArmies).length > 0) {
        // cleanup might be needed here, or assumed handled by resetBattle
    }

    // Access the current battle data from the global scope
    const battleData = window.currentBattleData;
    if (!battleData) {
        console.error("No battle data available for deployment!");
        return;
    }

    // Determine initial units from battle data or event data
    // If event has specific unit positions, use those. Otherwise look for initial_state
    const armies = battleData.armies || {};

    Object.entries(armies).forEach(([armyName, armyData]) => {
        createArmyUnits(armyName, armyData);
    });

    updateStatus(`Deployment Complete: ${event.description}`);
}

/**
 * Creates units for a specific army
 * @param {string} armyName 
 * @param {Object} armyData 
 */
function createArmyUnits(armyName, armyData) {
    console.log(`Creating units for ${armyName}`, armyData);

    battleArmies[armyName] = [];

    // Safety check for units array
    if (!armyData.units) return;

    armyData.units.forEach((unit, index) => {
        const unitTypeData = getUnitTypeData(unit.type);
        if (!unitTypeData) {
            console.warn(`Unknown unit type: ${unit.type}`);
            return;
        }

        const position = Cesium.Cartesian3.fromDegrees(
            unit.position.lon,
            unit.position.lat,
            0
        );

        // Create the entity
        const entity = viewer.entities.add({
            name: `${armyData.name} - ${unitTypeData.name}`,
            position: position,
            billboard: {
                image: createUnitCanvas(unitTypeData.visual_attributes.icon, unitTypeData.visual_attributes.color),
                scale: 1.0, // unitTypeData.visual_attributes.size_scale * 0.5,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY // Always visible
            },
            label: {
                text: unitTypeData.name,
                font: '12px sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -40),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000)
            },
            description: `
                <h3>${unitTypeData.name}</h3>
                <p>${unitTypeData.description}</p>
                <p>Army: ${armyData.name}</p>
                <p>Type: ${unit.type}</p>
            `
        });

        // Store reference in battleArmies
        battleArmies[armyName].push({
            id: unit.id || `${armyName}_${index}`,
            type: unit.type,
            entity: entity,
            data: unitTypeData
        });
    });
}

/**
 * Helper to get unit type data from UnitSystem
 */
function getUnitTypeData(typeStr) {
    if (!window.UnitSystem) return null;

    // Try to find in standard categories
    const categories = ['ancientUnits', 'medievalUnits', 'modernUnits'];
    for (const cat of categories) {
        const periodData = window.UnitSystem[cat];
        if (!periodData) continue;

        // Search through subcategories (infantry, cavalry, etc)
        for (const subCat in periodData) {
            if (periodData[subCat][typeStr]) {
                return periodData[subCat][typeStr];
            }
        }
    }
    return null;
}

/**
 * Creates a canvas icon for the billboard
 */
function createUnitCanvas(emoji, colorCode) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Background circle
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fillStyle = colorCode || '#888888';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Emoji
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(emoji || '♟️', 32, 32);

    return canvas;
}

/**
 * Handles decisive maneuver events (movement)
 */
function createDecisiveManeuverEffect(event) {
    console.log("⚔️ Decisive Maneuver:", event);

    if (event.movements) {
        applyUnitMovements(event.movements, 3.0); // 3 second duration
    }

    // Visual flair
    if (event.focus_location) {
        // Optionally flash area
    }
}

/**
 * Handles retreat events
 */
function createRetreatEffect(event) {
    console.log("🏳️ Retreat:", event);
    if (event.movements) {
        applyUnitMovements(event.movements, 5.0); // Slower retreat
    }
}

/**
 * Handles assault events
 */
function createAssaultEffect(event) {
    console.log("🔥 Assault:", event);

    if (event.movements) {
        applyUnitMovements(event.movements, 2.0); // Fast assault
    }

    // Show combat effects at target location if available
    if (event.target_location) {
        const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(event.target_location.lon, event.target_location.lat),
            point: {
                pixelSize: 20,
                color: Cesium.Color.RED.withAlpha(0.6),
                outlineColor: Cesium.Color.YELLOW,
                outlineWidth: 2
            }
        });

        // Remove after a few seconds
        setTimeout(() => viewer.entities.remove(entity), 2000);
    }
}

/**
 * Applies movement to units
 * @param {Array} movements - List of movement objects {army, unit_index, to: {lon, lat}}
 * @param {number} duration - Duration in seconds
 */
function applyUnitMovements(movements, duration) {
    movements.forEach(move => {
        const armyUnits = battleArmies[move.army];
        if (!armyUnits) return;

        // If unit_index is specific, move that unit. If 'all', move all?
        // Simplifying assumptions for now: move specific index or all if not specified? 
        // Let's assume the data structure matches specific units or groups.

        // For this implementation, we'll try to match unit indices
        // Using a safety check
        const unitIndex = move.unit_index !== undefined ? move.unit_index : 0;
        if (unitIndex >= armyUnits.length) return;

        const unit = armyUnits[unitIndex];
        const dest = move.to;

        // Animate position
        const startPos = unit.entity.position.getValue(viewer.clock.currentTime);
        const endPos = Cesium.Cartesian3.fromDegrees(dest.lon, dest.lat);

        animateEntityMove(unit.entity, startPos, endPos, duration * 1000);
    });
}

function animateEntityMove(entity, startPos, endPos, durationMs) {
    const startTime = Date.now();

    // Update listener
    const update = () => {
        const now = Date.now();
        const t = Math.min((now - startTime) / durationMs, 1.0);

        // Lerp
        const currentPos = Cesium.Cartesian3.lerp(startPos, endPos, t, new Cesium.Cartesian3());
        entity.position = new Cesium.ConstantPositionProperty(currentPos);

        if (t < 1.0) {
            requestAnimationFrame(update);
        }
    };

    requestAnimationFrame(update);
}

// Make functions globally available
window.createDeploymentEffect = createDeploymentEffect;
window.createDecisiveManeuverEffect = createDecisiveManeuverEffect;
window.createRetreatEffect = createRetreatEffect;
window.createAssaultEffect = createAssaultEffect;

console.log("✅ Large Scale Rendering System Loaded");
