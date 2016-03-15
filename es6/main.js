/* @flow */
/*global Class*/

import 'babel-polyfill';

document.addEventListener('DOMContentLoaded', function() {
    if (document.readyState === 'interactive') {
        main();
    }
});

function main() {
    console.log('starting game');
    let game = new Game();
    console.log('made entity');
    let e = game.makeEntity();
    console.log('adding component');
    e.addComponent(new HelloWorldComponent());
}

class Game {
    _entities: Array<Entity>;

    constructor() {
        this._entities = [];
    }

    makeEntity() {
        let entity = new Entity(this);
        this._entities.push(entity);
        return entity;
    }
}

class Component {
    _entity: Entity;
    _game: Game;

    init(entity: Entity, game: Game) {
        this._entity = entity;
        this._game = game;
        this.subInit();
    }

    subInit() {
    }
}

class HelloWorldComponent extends Component {
    subInit() {
        console.log('Hello World');
    }
}

class Entity {
    _components: { [key: string]: Component };
    _game : Game;

    constructor(game: Game) {
        this._game = game;
        this._components = {};
    }

    getComponent(kind: Class<Component>): Component {
        return this._components[kind.name];
    }

    addComponent(comp: Component) {
        this._components[comp.constructor.name] = comp;
        comp.init(this, this._game);
    }
}

class GridLayer {
    _grid: Array<Array<GridCell>>;

    constructor(width: number, height: number) {
        this._grid = [];
        for (let x = 0; x < width; x++) {
            let col = [];
            for (let y = 0; y < height; y++) {
                col.push(new GridCell(this, x, y));
            }
            this._grid.push(col);
        }
    }
}

class GridCell {
    _x: number;
    _y: number;
    _layer: GridLayer;
    _contents: Entity;

    constructor(layer: GridLayer, x: number, y: number) {
        this._layer = layer;
        this._x = x;
        this._y = y;
    }

    getLayer(): GridLayer {
        return this._layer;
    }

    getContents(): Entity {
        return this._contents;
    }

    setContents(entity: Entity) {
        this._contents = entity;
    }
}
