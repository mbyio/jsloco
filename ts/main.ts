/// <reference path="services.ts" />
/// <reference path="gameloop.ts" />
/// <reference path="helloworld.ts" />
/// <reference path="gui.ts" />
/// <reference path="rendering.ts" />
/// <reference path="states.ts" />

document.addEventListener("DOMContentLoaded", function() {
    if (document.readyState === "interactive") {
        main();
    }
});

function main() {
    let services = new ServiceContainer([
        {serviceType: GameLoopService, args:
            [HelloWorldService, RenderingService]},
        {serviceType: HelloWorldService},
        {serviceType: EntityService},
        {serviceType: ViewportService, args: {
            width: 800, height: 600, id: "gameViewport"}},
        {serviceType: RenderingService},
        {serviceType: StateService, args: {
            stateTypes: [MainState],
            startingState: MainState
        }}
    ]);
}

class MainState implements State {
    private entities: EntityService;

    constructor(services: ServiceContainer) {
        this.entities = services.require<EntityService>(EntityService);
    }

    onEnter() {
        for (let i = 0; i < 10; i++) {
            let e = this.entities.makeEntity();
            e.add(HelloWorldComponent);
            let render = e.add<RenderingComponent>(RenderingComponent);
            render.tint = Color.makeRandomRGB();
            render.width = 32;
            render.height = 32;
            let pos = e.add<PositionComponent>(PositionComponent);
            pos.x = Math.random() * 800;
            pos.y = Math.random() * 600;
        }
        let e = this.entities.makeEntity();
        let pos = e.add<PositionComponent>(PositionComponent);
        pos.x = 0;
        pos.y = 0;
        let render = e.add<RenderingComponent>(RenderingComponent);
        render.width = 32;
        render.height = 32;
        let img = new Image();
        img.src = "assets/lego-logo.jpg";
        img.addEventListener("load", () => {
            render.addAnimation("default", [new Sprite(img)]);
            render.switchTo("default");
        });
    }

    onExit() {
    }
}
