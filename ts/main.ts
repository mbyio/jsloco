/// <reference path="services.ts" />
/// <reference path="gameloop.ts" />
/// <reference path="helloworld.ts" />
/// <reference path="gui.ts" />
/// <reference path="rendering.ts" />

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
        {serviceType: RenderingService}
    ]);
    let entities = services.require<EntityService>(EntityService);
    for (let i = 0; i < 10; i++) {
        let e = entities.makeEntity();
        e.add(HelloWorldComponent);
        let render = e.add<RenderingComponent>(RenderingComponent);
        render.tintColor = Color.makeRandomRGB();
        render.width = 32;
        render.height = 32;
        let pos = e.add<PositionComponent>(PositionComponent);
        pos.x = Math.random() * 800;
        pos.y = Math.random() * 600;
    }
}
