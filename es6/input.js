import {GameService} from './game.js';
import {ViewportService} from './ui.js';

export const MOUSE_BUTTONS = {
    LEFT: 1,
    MIDDLE: 2,
    RIGHT: 3
};

/**
 * Converts the usual browser event driven input into stateful input (which is
 * much easier to program against in a game).
 */
export class InputManager extends GameService {
    _mouseX: number;
    _mouseY: number;
    _mouseOnElement: boolean;
    _mouseButtonStates: {[key: number]: boolean}

    subInit() {
        let viewport = this._game.getService(ViewportService).getViewport();

        this._mouseX = 0;
        this._mouseY = 0;
        this._mouseOnElement = false;
        this._mouseButtonStates = {};

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

        viewport.addEventListener('mouseenter', () => {
            this._mouseOnElement = true;
        });
        viewport.addEventListener('mouseleave', () => {
            this._mouseOnElement = false;
        });

        viewport.addEventListener('mousedown', (e) => {
            if (!(e instanceof MouseEvent)) {
                throw new Error('unexpected event type encountered.');
            }
            if (e.which === 0) {
                throw new Error('no button pressed?');
            }
            console.log('mousedown');
            this._mouseButtonStates[e.which] = true;
            return false;
        });

        viewport.addEventListener('mouseup', (e) => {
            if (!(e instanceof MouseEvent)) {
                throw new Error('unexpected event type encountered.');
            }
            if (e.which === 0) {
                throw new Error('no button pressed?');
            }
            console.log('mouseup');
            this._mouseButtonStates[e.which] = false;
            return false;
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

    getMouseButtonState(id: number): boolean {
        return !!this._mouseButtonStates[id];
    }
}
