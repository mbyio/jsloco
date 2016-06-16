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

    setComp(entity, comp) {
        assertDefined(entity);
        assertDefined(comp);

        // Ignore unknown entities
        if (!this.entities.has(entity)) {
            return;
        }

        // Add a comp type if necessary
        if (!this.comp.has(comp.constructor.name)) {
            this.comp.set(comp.constructor.name, new Map());
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
        for (let compsOfType of this.comps) {
            compsOfType.delete(entity);
        }
    }
}

class Grid {
    constructor(width, height) {
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

    coordIsInBounds(x, y) {
        return x >= 0 && x < this.__width && y >= 0 && y < this.__height;
    }

    get(x, y) {
        return this.__grid[x][y];
    }

    set(x, y, v) {
        if (!this.coordIsInBounds(x, y)) {
            return;
        }
        this.__grid[x][y] = v;
    }
}
