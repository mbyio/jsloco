/* @flow */

import {GameService} from './game.js';
import * as config from './config.js';

export class ViewportService extends GameService {
    _viewport: HTMLElement;
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;

    subInit() {
        this._viewport = document.getElementById('gameViewport');
        if (this._viewport == null) {
            throw new Error('Unable to retrieve game viewport.');
        }
        this._viewport.style.width = `${config.VIEWPORT_WIDTH}px`;
        this._viewport.style.height = `${config.VIEWPORT_HEIGHT}px`;

        // This is sort of weird looking code because Flow is unable to handle
        // document.createElement properly.
        let canvas = document.createElement('canvas');
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Unable to create canvas.');
        }
        canvas.width = config.VIEWPORT_WIDTH;
        canvas.height = config.VIEWPORT_HEIGHT;
        this._canvas = canvas;
        this._viewport.appendChild(canvas);

        this._ctx = canvas.getContext('2d');
        if (this._ctx == null) {
            throw new Error('Unable to create 2D rendering context.');
        }
    }

    getViewport(): HTMLElement {
        return this._viewport;
    }

    getCanvas(): HTMLCanvasElement {
        return this._canvas;
    }

    getContext(): CanvasRenderingContext2D {
        return this._ctx;
    }
}
