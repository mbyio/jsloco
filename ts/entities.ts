/// <reference path="game.ts" />
/// <reference path="util.ts" />
/// <reference path="events.ts" />

class Entity implements Evented {
    private static idCounter: number = 0;
    private static makeId() {
        Entity.idCounter += 1;
        return Entity.idCounter;
    }

    private components: Map<Component>;
    private _id: number;
    private _events: EventBus;

    constructor(private game: Game) {
        this._id = Entity.makeId();
        this._events = new EventBus();
        this.components = {};
    }

    get events(): EventBus {
        return this._events;
    }

    addComponent<T extends Component>(
            componentType: {new(Entity, Game): T, name: string},
            args: any) {
        let name = componentType.name;
        if (this.components[name] != null) {
            throw new Error(`Entity already has component of type ${name}.`);
        }
        this.components[name] = new componentType(this, this.game);
        this.game.fireEvent(this.addComponentEventName);
    }

    get id(): number {
        return this.id;
    }

    get addComponentEventName(): string {
        return `Entity(${this._id})#addComponent`;
    }
}

class Component {
    constructor(private entity: Entity, private game: Game, args: any) {
    }
}
