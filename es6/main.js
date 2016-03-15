/* @flow */
/*global Class*/

import 'babel-polyfill';
import * as config from './config.js';

/**
 * A nice blue color.
 */
export const CORNFLOWER_BLUE = 'rgb(100,149,237)';

document.addEventListener('DOMContentLoaded', function() {
    if (document.readyState === 'interactive') {
        main();
    }
});

/**
 * The main program entry method. Executes after the DOM is ready to be
 * manipulated (but probably before it is rendered for the first time).
 */
function main() {
    let game = new Game();
    let e = game.makeEntity();
    e.addComponent(new SpriteComponent('assets/lego-logo.jpg', 16, 16));
    e.x = 128;
    e.y = 128;
    let mouseFollow = game.makeEntity();
    mouseFollow.addComponent(new FillRectComponent('rgb(255,0,0)', 16, 16));
    mouseFollow.addComponent(new CursorFeedbackComponent());
    game.start();
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
    _isRunning: boolean;
    _grid: GridLayer;
    _input: InputManager;

    constructor() {
        this._entities = [];
        this._isRunning = false;

        // Setup the display
        let width = config.GRID_WIDTH * config.CELL_SIZE;
        let height = config.GRID_HEIGHT * config.CELL_SIZE;
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

        // Setup grid
        this._grid = new GridLayer(
            config.GRID_WIDTH, config.GRID_HEIGHT, config.CELL_SIZE);

        // Input
        this._input = new InputManager(this._viewport);
    }

    getInput(): InputManager {
        return this._input;
    }

    getGrid(): GridLayer {
        return this._grid;
    }

    makeEntity() {
        let entity = new Entity(this);
        this._entities.push(entity);
        return entity;
    }

    /**
     * Starts the game.
     */
    start() {
        if (this._isRunning) {
            throw new Error('This game has already started.');
        }

        this.gameLoop();
    }

    /**
     * The game loop. Continues indefinitely as long as requestAnimationFrame
     * keeps firing.
     *
     * Warning: do NOT call this method directly.
     */
    gameLoop() {
        //////////////////// Updating  ////////////////////

        // TODO this could be optimized using component systems
        for (let i = 0; i < COMPONENT_UPDATE_ORDER.length; i++) {
            let componentType = COMPONENT_UPDATE_ORDER[i];
            for (let j = 0; j < this._entities.length; j++) {
                let entity = this._entities[j];
                let component = entity.getComponent(componentType);
                if (component != null) {
                    component.update();
                }
            }
        }

        //////////////////// Rendering ////////////////////

        // Clear the background
        this._ctx.fillStyle = CORNFLOWER_BLUE;
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        // Sort entities so they overlap properly
        this._entities.sort((left, right) => {
            if (left.y < right.y) {
                return -1;
            } else if (left.y === right.y) {
                return 0;
            } else {
                return 1;
            }
        });

        // Render anything with a sprite
        for (let i = 0; i < this._entities.length; i++) {
            let entity = this._entities[i];
            if (!entity.isVisible()) {
                continue;
            }
            let sprite = entity.getComponent(SpriteComponent);
            if (sprite == null) {
                continue;
            }
            let img = sprite.getImage();
            if (img == null) {
                continue;
            }
            this._ctx.drawImage(
                img,
                entity.x,
                entity.y - sprite.getHeight(),
                sprite.getWidth(),
                sprite.getHeight()
            );
        }
        // Render anything with a fill rect
        for (let i = 0; i < this._entities.length; i++) {
            let entity = this._entities[i];
            if (!entity.isVisible()) {
                continue;
            }
            let fillRect = entity.getComponent(FillRectComponent);
            if (fillRect == null) {
                continue;
            }
            this._ctx.fillStyle = fillRect.getFillStyle();
            this._ctx.fillRect(
                entity.x,
                entity.y - fillRect.getHeight(),
                fillRect.getWidth(),
                fillRect.getHeight()
            );
        }

        // Continue the loop
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }
}

/**
 * Converts the usual browser event driven input into stateful input (which is
 * much easier to program against in a game).
 */
class InputManager {
    _mouseX: number;
    _mouseY: number;
    _mouseOnElement: boolean;

    constructor(viewport: HTMLElement) {
        this._mouseX = 0;
        this._mouseY = 0;
        this._mouseOnElement = false;

        viewport.addEventListener('mousemove', (e: Event) => {
            // flowtype can't infer that we'll receive a MouseEvent, so we have
            // to check it at runtime.
            if (!(e instanceof MouseEvent)) {
                throw new Error('unexpected event type encountered.');
            }
            let rect = viewport.getBoundingClientRect();
            let realX = e.clientX - rect.left;
            let realY = e.clientY - rect.top;
            if (realX < 0 || realX >= viewport.offsetWidth ||
                    realY < 0 || realY >= viewport.offsetHeight) {
                this._mouseOnElement = false;
            } else {
                this._mouseOnElement = true;
            }
            this._mouseX = realX;
            this._mouseY = realY;
        });

        // TODO check if these events are actually necessary - we might just be
        // able to do everything in mousemove.
        viewport.addEventListener('mouseenter', () => {
            this._mouseOnElement = true;
        });
        viewport.addEventListener('mouseleave', () => {
            this._mouseOnElement = false;
        });
    }

    isMouseOnElement(): boolean {
        return this._mouseOnElement;
    }

    getMouseX(): number {
        return this._mouseX;
    }

    getMouseY(): number {
        return this._mouseY;
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

    /**
     * Called every frame in accordance with COMPONENT_UPDATE_ORDER.
     */
    update() {
    }
}

class SpriteComponent extends Component {
    _img: ?HTMLImageElement;
    _width: number;
    _height: number;

    constructor(src: string, width: number, height: number) {
        super();

        let img = new Image();
        img.src = src;
        // If the image is loaded, assign it to _img; otherwise wait until it is
        // loaded. Eventually this should be replaced with a real resource
        // management system.
        if (img.complete) {
            this._img = img;
        } else {
            this._img = null;
            img.addEventListener('load', () => {
                this._img = img;
            });
        }

        this._width = width;
        this._height = height;
    }

    /**
     * Get the sprite's image. Returns null/undefined if it isn't loaded yet.
     */
    getImage(): ?HTMLImageElement {
        return this._img;
    }

    getWidth(): number {
        return this._width;
    }

    getHeight(): number {
        return this._height;
    }
}

class FillRectComponent extends Component {
    _fillStyle: string;
    _width: number;
    _height: number;

    constructor(fillStyle: string, width: number, height: number) {
        super();
        this._fillStyle = fillStyle;
        this._width = width;
        this._height = height;
    }

    getFillStyle(): string {
        return this._fillStyle;
    }

    getWidth(): number {
        return this._width;
    }

    getHeight(): number {
        return this._height;
    }
}

class CursorFeedbackComponent extends Component {
    update() {
        let input = this._game.getInput();
        if (!input.isMouseOnElement()) {
            this._entity.setVisibility(false);
            return;
        }
        this._entity.setVisibility(true);
        let grid = this._game.getGrid();
        let {x: gridX, y: gridY} = grid.pixelToGridCoords(
            input.getMouseX(), input.getMouseY());
        let {x: finalX, y: finalY} = grid.gridToPixelCoords(gridX, gridY);
        this._entity.x = finalX;
        this._entity.y = finalY;
    }
}

/**
 * An entity in the game world. It does not need to have a physical
 * representation. It contains components which provide behavior, visual, audio,
 * etc. for this component.
 *
 * All entities have an (x,y) position. This may get moved into a component
 * later, but for now it is for convenience.
 *
 * If an entity is on a grid, their x and y coordinates should be the lowest,
 * leftmost point of their position on the grid.
 */
class Entity {
    x: number;
    y: number;
    _isVisible: boolean;
    _components: { [key: string]: Component };
    _game : Game;

    constructor(game: Game) {
        this._game = game;
        this._components = {};
        this._isVisible = true;
        this.x = 0;
        this.y = 0;
    }

    /**
     * Gets a component from the entity.
     *
     * @param kind: The constructor function that created the component you want
     * to retrieve.
     *
     * Example:
     *     let e = game.makeEntity();
     *     let sprite = e.getComponent(SpriteComponent);
     *     if (sprite != null) {
     *         // do stuff with the component here
     *     }
     */
    getComponent<T: Component>(kind: Class<T>): ?T {
        let comp = this._components[kind.name];
        if (comp == null || comp instanceof kind) {
            return comp;
        }
        throw Error('Component is of the wrong type.');
    }

    /**
     * Adds a component to the entity. Overwrites an existing component of the
     * same type if the entity already has it.
     */
    addComponent(comp: Component) {
        this._components[comp.constructor.name] = comp;
        comp.init(this, this._game);
    }

    isVisible(): boolean {
        return this._isVisible;
    }

    setVisibility(v: boolean) {
        this._isVisible = v;
    }
}

/**
 * A layer of the grid. May contain entities. Some entities might be in more
 * than one cell at the same time (ie. entities might be rectangular, square,
 * etc.)
 */
class GridLayer {
    _grid: Array<Array<?Entity>>;
    _cellSize: number;

    constructor(width: number, height: number, cellSize: number) {
        this._grid = [];
        for (let x = 0; x < width; x++) {
            let col = [];
            for (let y = 0; y < height; y++) {
                col.push(null);
            }
            this._grid.push(col);
        }
        this._cellSize = cellSize;
    }

    get(x: number, y: number): ?Entity {
        if (x < 0 || x >= this._grid.length ||
                y < 0 || y >= this._grid[0].length) {
            throw new Error('Grid access out of bounds.');
        }
        return this._grid[x][y];
    }

    set(x: number, y: number, width: number, height: number, entity: Entity) {
        if (x < 0 || x >= this._grid.length ||
                y < 0 || y >= this._grid[0].length ||
                width < 0 || x + width >= this._grid.length ||
                height < 0 || y + height >= this._grid[0].length) {
            throw new Error('Grid access out of bounds.');
        }
        for (let x1 = 0; x1 < x + width; x1++) {
            for (let y1 = 0; y1 < y + height; y1++) {
                this._grid[x1][y1] = entity;
            }
        }
    }

    /**
     * Given pixel coordinates, returns the coordinates of the cell the pixel
     * coordinates are within.
     */
    pixelToGridCoords(x: number, y: number): {x: number, y: number} {
        if (x < 0 || x >= this._grid.length * this._cellSize ||
                y < 0 || y >= this._grid[0].length * this._cellSize) {
            throw new Error(`Pixel coords (${x},${y}) are out of bounds.`);
        }
        return {
            x: Math.floor(x / this._cellSize),
            y: Math.floor(y / this._cellSize)
        };
    }

    gridToPixelCoords(x: number, y: number): {x: number, y: number} {
        if (x < 0 || x >= this._grid.length ||
                y < 0 || y >= this._grid[0].length) {
            throw new Error('Grid coords out of bounds.');
        }
        return {
            x: x * this._cellSize,
            y: y * this._cellSize + this._cellSize
        };
    }
}

/**
 * Order in which component update methods will be called.
 *
 * TODO Come up with an object oriented way of doing this.
 */
export const COMPONENT_UPDATE_ORDER = [
    CursorFeedbackComponent
];
