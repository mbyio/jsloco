function assertDefined(var) {
    if (var == null) {
        throw new Error("assertDefined() failed.");
    }
}

function WARN(o) {
    console.warn(o);
}

class Entity {
    constructor(entityManager) {
        this.__manager = entityManager;
    }

    set(comp) {
        this.__manager.setComp(this, comp);
    }

    get(compType) {
        this.__manager.getComp(this, compTypeName);
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
        assertDefined(comp);

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

        let compsOfType = this.comps.get(comps.constructor.name);
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

/**
 * Represents an object in the grid and all the spaces they fill.
 */
class GridSpan {
    constructor(coords, item) {
        assertDefined(coords);
        assertDefined(item);

        this.__item = item;
        this.__coords = coords;
    }

    get item() {
        return this.__item;
    }

    get coords() {
        return this.__coords;
    }
}

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
            return this.__grid[coord.x][coord.y].item;
        }
    }

    setIfEmpty(coords, item) {
        assertDefined(coords);
        assertDefined(item);

        // Make sure all coordinates are unoccupied and in the grid.
        for (let coord of coords) {
            if (!this.coordIsInBounds(coord) || this.get(coord) == null) {
                return false;
            }
        }

        let span = new GridSpan(coords, item);
        for (let coord of coords) {
            this.__grid[coord.x][coord.y] = span;
        }
        return true;
    }
}
