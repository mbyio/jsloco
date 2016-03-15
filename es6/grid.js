import {Entity} from './game.js';

/**
 * A layer of the grid. May contain entities. Some entities might be in more
 * than one cell at the same time (ie. entities might be rectangular, square,
 * etc.)
 */
export class GridLayer {
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
