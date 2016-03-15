/**
 * Converts the usual browser event driven input into stateful input (which is
 * much easier to program against in a game).
 */
export default class InputManager {
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
