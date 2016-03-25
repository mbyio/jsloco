/// <reference path="services.ts" />
/// <reference path="entities.ts" />
/// <reference path="gameloop.ts" />

class HelloWorldService implements Service, RunnableService {
    private entities: EntityService;

    constructor(args: any) {
    }

    init(services: ServiceContainer) {
        this.entities = services.require<EntityService>(EntityService);
    }

    run() {
        console.log("hello");
        for (let entity of this.entities.getEntitiesWithComponents(
                [HelloWorldComponent])) {
            console.log("Hello world!");
        }
    }
}

class HelloWorldComponent implements Component {
    constructor(entity: Entity, services: ServiceContainer) {
    }
}
