/* @flow */
/*global Class*/

import 'babel-polyfill';
import * as config from './config.js';
import InputManager from './input.js';
import {GridLayer} from './grid.js';
import {SpriteComponent, FillRectComponent} from './graphics.js';

/**
 * A nice blue color.
 */
const CORNFLOWER_BLUE = 'rgb(100,149,237)';

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
export class Entity {
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
 * This is an abstract class defining the interface for entity components.
 */
export class Component {
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

/**
 * The "god object" that manages the game loop and provides access to game
 * services.
 *
 * Maybe there's a better way to organize things, but having one monolithic
 * object seems to be easiest for games.
 */
export class Game {
    _entities: Array<Entity>;
    _viewport: HTMLElement;
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;
    _isRunning: boolean;
    _grid: GridLayer;
    _input: InputManager;
    _updateOrder: Array<any>;

    constructor(updateOrder: Array<any>) {
        this._updateOrder = updateOrder;

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

    makeEntity(): Entity {
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
        for (let i = 0; i < this._updateOrder.length; i++) {
            let componentType = this._updateOrder[i];
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
