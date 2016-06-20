"use strict";

function assertDefined(v) {
    if (v == null) {
        throw new Error("assertDefined() failed.");
    }
}

function WARN(o) {
    console.warn(o);
}

/*******************************************************************************
 * Entities
 ******************************************************************************/

class Entity {
    constructor(entityManager) {
        this.__manager = entityManager;
    }

    set(comp) {
        this.__manager.setComp(this, comp);
    }

    get(compType) {
        this.__manager.getComp(this, compType);
    }

    has(compType) {
        this.__manager.hasComp(this, compType);
    }
}

class EntityManager {
    constructor() {
        this.comps = new Map();
        this.entities = new Set();
    }

    makeEntity() {
        let e = new Entity(this);
        this.entities.add(e);
        return e;
    }

    hasComp(entity, compType) {
        assertDefined(entity);
        assertDefined(compType);

        // Ignore unknown entities
        if (!this.entities.has(entity)) {
            return false;
        }

        let compsOfType = this.comps.get(compType.name);
        if (compsOfType == null) {
            return false;
        }

        return compsOfType.get(entity) != null;
    }

    setComp(entity, comp) {
        assertDefined(entity);
        assertDefined(comp);

        // Ignore unknown entities
        if (!this.entities.has(entity)) {
            return;
        }

        // Add a comp type if necessary
        if (!this.comps.has(comp.constructor.name)) {
            this.comps.set(comp.constructor.name, new Map());
        }

        let compsOfType = this.comps.get(comp.constructor.name);
        compsOfType.set(entity, comp);
    }

    getComp(entity, compType) {
        assertDefined(entity);
        assertDefined(compType.name);

        let compsOfType = this.comps.get(compType.name);
        if (compsOfType == null) {
            return null;
        }
        return compsOfType.get(entity);
    }

    deleteEntity(entity) {
        assertDefined(entity);

        // Ignore unknown entities
        if (!this.entities.has(entity)) {
            return;
        }

        // Deactivate the entity and remove all components
        this.entities.delete(entity);
        for (let compsOfType of this.comps.values()) {
            compsOfType.delete(entity);
        }
    }

    entitiesWithComps(compTypes) {
        assertDefined(compTypes);

        let out = [];

        let firstCompType = compTypes[0];
        if (firstCompType == null) {
            return out;
        }

        // Iterate over entities with firstCompType, if they are missing any of
        // the others then skip them, otherwise add them to out.
        entities:
        for (let entity of this.comps.get(firstCompType.name).keys()) {
            for (let i = 1; i < compTypes.length; i++) {
                let compType = compTypes[i];
                if (!this.has(entity, compType.name)) {
                    continue entities;
                }
            }
            out.push(entity);
        }

        return out;
    }
}

/*******************************************************************************
 * Grid Position
 ******************************************************************************/

/**
 * A 2D grid. Objects may take up multiple spaces in the grid.
 */
class Grid {
    constructor(width, height) {
        assertDefined(width);
        assertDefined(height);

        this.__width = width;
        this.__height = height;
        this.__grid = [];
        for (let x = 0; x < width; x++) {
            let col = [];
            for (let y = 0; y < height; y++) {
                col.push(null);
            }
            this.__grid.push(col);
        }
    }

    coordIsInBounds(coord) {
        assertDefined(coord);

        return coord.x >= 0 && coord.x < this.__width
            && coord.y >= 0 && coord.y < this.__height;
    }

    get(coord) {
        assertDefined(coord);

        let span = this.__grid[coord.x][coord.y];
        if (span == null) {
            return null;
        } else {
            return this.__grid[coord.x][coord.y].entity;
        }
    }

    setIfEmpty(entity, coords) {
        assertDefined(entity);
        assertDefined(coords);

        if (coords.length == 0) {
            throw new Error("At least one grid coordinate required.");
        }

        // Make sure all coordinates are valid and empty
        for (let coord of coords) {
            if (!this.coordIsInBounds(coord) || this.get(coord) != null) {
                return false;
            }
        }

        // Entities should either have a free position or grid position.
        if (entity.has(FreePosition)) {
            throw new Error("Entity has a free position component already.");
        }

        // If the entity already has a grid position, remove it from the grid.
        // Otherwise make a new component.
        let gridPosition = entity.get(GridPosition);
        if (gridPosition != null) {
            for (let coord of gridPosition.coords) {
                this.__grid[coord.x][coord.y] = null;
            }
            gridPosition.coords = coords;
        } else {
            gridPosition = new GridPosition(entity, coords);
            entity.set(gridPosition);
        }

        for (let coord of gridPosition.coords) {
            this.__grid[coord.x][coord.y] = gridPosition;
        }
    }
}

class GridPosition {
    constructor(entity, coords) {
        assertDefined(entity);
        assertDefined(coords);

        if (coords.length == 0) {
            throw new Error("At least one grid coordinate required.");
        }

        this.entity = entity;
        this.coords = coords;

        let x = Number.NEGATIVE_INFINITY;
        let y = Number.NEGATIVE_INFINITY;
        for (let coord of coords) {
            x = Math.max(coord.x, x);
            y = Math.max(coord.y, y);
        }

        this.x = x;
        this.y = y;
    }
}

/*******************************************************************************
 * Free Position
 ******************************************************************************/

class FreePosition {
    constructor(entity, x, y) {
        assertDefined(entity);

        this.entity = entity;
        this.x = x || 0;
        this.y = y || 0;
    }
}

/*******************************************************************************
 * Canvas
 ******************************************************************************/

class Canvas {
    constructor(container, width, height) {
        assertDefined(container);
        assertDefined(width);
        assertDefined(height);

        let canvas = document.createElement("canvas");
        assertDefined(canvas);

        canvas.width = width;
        canvas.height = height;

        container.appendChild(canvas);

        this.__canvas = canvas;
        this.__ctx = canvas.getContext('2d');
        this.__width = width;
        this.__height = height;
    }

    get canvas() {
        return this.__canvas;
    }

    get ctx() {
        return this.__ctx;
    }

    get width() {
        return this.__width;
    }

    get height() {
        return this.__height;
    }
}

/*******************************************************************************
 * Game
 ******************************************************************************/

class Game {
    constructor(services) {
        assertDefined(services);

        this.services = new Map();
        for (let service of services) {
            this.services.set(service.constructor.name, service);
        }

        this.__requestId = null;
    }

    get isRunning() {
        return this.__requestId != null;
    }

    get(serviceType) {
        assertDefined(serviceType);

        this.services.get(serviceType.name);
    }

    start() {
        if (this.isRunning) {
            throw new Error("Game is already running.");
        }
        this.__requestId = window.requestAnimationFrame(
            () => {
                this.__gameLoop();
            }
        );
    }

    stop() {
        if (!this.isRunning) {
            throw new Error("Game is not running.");
        }
        window.cancelAnimationFrame(this.__requestId);
        this.__requestId = null;
    }

    __gameLoop() {
        console.log("loop");
        window.requestAnimationFrame(() => { this.__gameLoop(); });
    }
}

/*******************************************************************************
 * Main
 ******************************************************************************/

function main() {
    let entityManager = new EntityManager();
    let grid = new Grid(200, 200);
    let canvas = new Canvas(document.getElementById("viewport"), 1024, 768);
    let game = new Game([entityManager, grid, canvas]);
    game.start();

    for (let i = 0; i < 10; i++) {
        let entity = entityManager.makeEntity();
        let coords = [];
        for (let x = i * 10; x < i * 10 + 10; x++) {
            for (let y = i * 10; y < i * 10 + 10; y++) {
                coords.push({x: x, y: y});
            }
        }
        if (grid.setIfEmpty(entity, coords) == false) {
            throw new Error("Overlapping entities.");
        }
    }
    console.log(entityManager);
}
