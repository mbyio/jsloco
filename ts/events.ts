/// <reference path="util.ts" />

interface Evented {
    // TODO make this readonly when TypeScript 2.0 comes out to enforce
    // implementers only providing a "get" accessor
    events: EventBus;
}

interface EventData {
}

interface EventHandler {
    (e: EventData): void;
}

class EventBus {
    private eventHandlers: Map<Array<EventHandler>>;

    constructor() {
        this.eventHandlers = {};
    }

    on(name: string, handler: EventHandler) {
        let handlers = this.eventHandlers[name];
        if (handlers == null) {
            handlers = [];
            this.eventHandlers[name] = handlers;
        }
        handlers.push(handler);
    }
}
