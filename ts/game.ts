/// <reference path="util.ts" />
/// <reference path="events.ts" />

class Game implements Evented {
    private loopWrapper: () => void;
    private eventSwitchboard: Map<Array<() => void>>;
    private _events: EventBus = new EventBus();

    constructor() {
        this.loopWrapper = () => {
            this.gameLoop();
        };
        this.gameLoop();
    }

    get events(): EventBus {
        return this._events;
    }

    private gameLoop() {
        console.log("Loop!");
        window.requestAnimationFrame(this.loopWrapper);
    }
}
