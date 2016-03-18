/* @flow */

import {GameService} from './game.js';

/**
 * A layer of the grid. May contain entities. Some entities might be in more
 * than one cell at the same time (ie. entities might be rectangular, square,
 * etc.)
 */
export class GridManager extends GameService {
    _grid: Array<Array<?number>>;
    _cellSize: number;
    _width: number;
    _height: number;
    _cellSize: number;

    constructor(width: number, height: number, cellSize: number) {
        // triggers a bug in eslint
        super();

        this._width = width;
        this._height = height;
        this._cellSize = cellSize;
    }

    subInit() {
        this._grid = [];
        for (let x = 0; x < this._width; x++) {
            let col = [];
            for (let y = 0; y < this._height; y++) {
                col.push(null);
            }
            this._grid.push(col);
        }
    }

    isInBounds(x: number, y: number, width: ?number, height: ?number): boolean {
        width = width || 1;
        height = height || 1;
        return !(x < 0 || x >= this._grid.length ||
                y < 0 || y >= this._grid[0].length ||
                x + width - 1 >= this._grid.length ||
                y + height - 1 >= this._grid[0].length);
    }

    get(x: number, y: number): ?number {
        if (!this.isInBounds(x, y)) {
            throw new Error('Grid access out of bounds.');
        }
        return this._grid[x][y];
    }

    isAreaEmpty(x: number, y: number, width: number, height: number): boolean {
        if (!this.isInBounds(x, y, width, height)) {
            throw new Error('Grid access out of bounds.');
        }
        for (let x1 = x; x1 < x + width; x1++) {
            for (let y1 = y; y1 < y + height; y1++) {
                if (this._grid[x1][y1] != null) {
                    return false;
                }
            }
        }
        return true;
    }

    set(x: number, y: number, width: number, height: number, entity: number) {
        if (!this.isInBounds(x, y, width, height)) {
            throw new Error('Grid access out of bounds.');
        }
        for (let x1 = x; x1 < x + width; x1++) {
            for (let y1 = y; y1 < y + height; y1++) {
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
