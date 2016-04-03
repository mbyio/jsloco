/// <reference path="services.ts" />
/// <reference path="gameloop.ts" />
/// <reference path="helloworld.ts" />
/// <reference path="gui.ts" />
/// <reference path="rendering.ts" />
/// <reference path="states.ts" />
/// <reference path="resources.ts" />

document.addEventListener("DOMContentLoaded", function() {
    if (document.readyState === "interactive") {
        main();
    }
});

function main() {
    let services = new ServiceContainer([
        {serviceType: GameLoopService, args:
            [RenderingService]},
        {serviceType: EntityService},
        {serviceType: ViewportService, args: {
            width: 800, height: 600, id: "gameViewport"}},
        {serviceType: RenderingService},
        {serviceType: StateService, args: {
            stateTypes: [MainState],
            startingState: MainState
        }},
        {serviceType: ResourceManager}
    ]);
}

class MainState implements State {
    private entities: EntityService;
    private resources: ResourceManager;

    constructor(services: ServiceContainer) {
        this.entities = services.require<EntityService>(EntityService);
        this.resources = services.require<ResourceManager>(ResourceManager);
    }

    onEnter() {
        let e = this.entities.makeEntity();
        let pos = e.add<PositionComponent>(PositionComponent);
        pos.x = 0;
        pos.y = 0;
        let render = e.add<RenderingComponent>(RenderingComponent);
        render.width = 32;
        render.height = 32;
        this.resources.loadImage("assets/sprite_ugly.png").then(
            (img) => {
                let animation: Array<Sprite> = [];
                for (let i = 0; i < 4; i++) {
                    let x = i * 32;
                    animation.push(new Sprite(img, x, 0, 32, 32));
                }
                render.addAnimation("default", animation);
                render.switchTo("default");
            },
            (e) => {
                throw new Error("Failed to load image.");
            }
        );
    }

    onExit() {
    }
}
