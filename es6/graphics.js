import {Component} from './game.js';

export class SpriteComponent extends Component {
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

export class FillRectComponent extends Component {
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
