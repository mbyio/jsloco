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

export const TOOLBOX_TOOLS = {
    BIG: 'BIG',
    SMALL: 'SMALL',
    DELETE: 'DELETE'
};

export class ToolboxService extends GameService {
    _selectedTool: string;
    _buttons: {[key: string]: HTMLButtonElement};

    subInit() {
        let toolboxDiv = document.getElementById('toolbox');
        if (toolboxDiv == null) {
            throw new Error('Could not find toolbox container.');
        }

        this._buttons = {};
        for (let buttonName of Object.keys(TOOLBOX_TOOLS)) {
            let button = document.createElement('button');
            if (!(button instanceof HTMLButtonElement)) {
                throw new Error('Could not create button.');
            }
            button.innerHTML = buttonName.toLowerCase();
            button.addEventListener('click', () => {
                let oldButton = this._buttons[this._selectedTool];
                if (oldButton != null) {
                    oldButton.disabled = false;
                }
                this._selectedTool = TOOLBOX_TOOLS[buttonName];
                button.disabled = true;
            });
            toolboxDiv.appendChild(button);
            this._buttons[TOOLBOX_TOOLS[buttonName]] = button;
        }
    }

    getSelectedTool(): ?string {
        return this._selectedTool;
    }
}
