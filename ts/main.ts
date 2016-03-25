/// <reference path="services.ts" />
/// <reference path="gameloop.ts" />
/// <reference path="helloworld.ts" />

document.addEventListener("DOMContentLoaded", function() {
    if (document.readyState === "interactive") {
        main();
    }
});

function main() {
    let services = new ServiceContainer([
        {serviceType: GameLoopService, args: <any>[HelloWorldService]},
        {serviceType: HelloWorldService},
        {serviceType: EntityService}
    ]);
    let entities = services.require<EntityService>(EntityService);
    for (let i = 0; i < 10; i++) {
        let e = entities.makeEntity();
        e.add(HelloWorldComponent);
    }
}
