/* @flow */
/*global Class*/

import 'babel-polyfill';

/**
 * The length in pixels of the side of a cell.
 */
const CELL_SIZE = 16;

/**
 * The width of the grid in cells.
 */
const GRID_WIDTH = 50;

/**
 * The height of the grid in cells.
 */
const GRID_HEIGHT = 37;

/**
 * A nice blue color.
 */
const CORNFLOWER_BLUE = 'rgb(100,149,237)';

document.addEventListener('DOMContentLoaded', function() {
    if (document.readyState === 'interactive') {
        main();
    }
});

function main() {
    let game = new Game();
    let e = game.makeEntity();
    e.addComponent(new HelloWorldComponent());
    //let grid = new GridLayer(GRID_WIDTH, GRID_HEIGHT);
}

/**
 * The "god object" that manages the game loop and provides access to game
 * services.
 *
 * Maybe there's a better way to organize things, but having one monolithic
 * object seems to be easiest for games.
 */
class Game {
    _entities: Array<Entity>;
    _viewport: HTMLElement;
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;

    constructor() {
        this._entities = [];

        // Setup the display
        let width = GRID_WIDTH * CELL_SIZE;
        let height = GRID_HEIGHT * CELL_SIZE;
        this._viewport = document.getElementById('gameViewport');
        this._viewport.style.width = `${width}px`;
        this._viewport.style.height = `${height}px`;
        
        // Workaround a weird bug in Flow by explicity checking that canvas has
        // the right type. Don't change the order of the following instructions!
        // Flow will complain, probably because it is buggy.
        let canvas = document.createElement('canvas');
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Unable to create canvas element.');
        }
        this._viewport.appendChild(canvas);
        this._canvas = canvas;
        this._canvas.width = width;
        this._canvas.height = height;
        this._ctx = this._canvas.getContext('2d');
        this._ctx.fillStyle = CORNFLOWER_BLUE;
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    makeEntity() {
        let entity = new Entity(this);
        this._entities.push(entity);
        return entity;
    }
}

/**
 * This is an abstract class defining the interface for entity components.
 */
class Component {
    _entity: Entity;
    _game: Game;

    /**
     * init does some bookkeeping and then calls subInit. Behavior unique to
     * each component should be placed in subInit.
     */
    init(entity: Entity, game: Game) {
        this._entity = entity;
        this._game = game;
        this.subInit();
    }

    /**
     * Called after the component has been attached to a component.
     */
    subInit() {
    }
}

class HelloWorldComponent extends Component {
    subInit() {
        console.log('Hello World');
    }
}

/**
 * An entity in the game world. It does not need to have a physical
 * representation. It contains components which provide behavior, visual, audio,
 * etc. for this component.
 */
class Entity {
    _components: { [key: string]: Component };
    _game : Game;

    constructor(game: Game) {
        this._game = game;
        this._components = {};
    }

    getComponent<T: Component>(kind: Class<T>): ?T {
        let comp = this._components[kind.name];
        if (comp == null || comp instanceof kind) {
            return comp;
        }
        throw Error('Component is of the wrong type.');
    }

    addComponent(comp: Component) {
        this._components[comp.constructor.name] = comp;
        comp.init(this, this._game);
    }
}

/**
 * A layer of the grid. May contain entities. Some entities might be in more
 * than one cell at the same time (ie. entities might be rectangular, square,
 * etc.)
 */
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
