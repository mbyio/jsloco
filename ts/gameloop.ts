/// <reference path="services.ts" />

class GameLoopService implements Service {
    loopHelper: () => void = () => { this.gameLoop(); };
    runnables: Array<RunnableService> = [];
    runnableTypes: Array<ServiceType>;

    constructor(args: any) {
        this.runnableTypes = args;
    }

    init(services: ServiceContainer) {
        for (let runnableType of this.runnableTypes) {
            console.log(runnableType);
            let service = services.require<RunnableService>(runnableType);
            // Needed because TypeScript isn't smart enough to figure out if
            // it's runnable or not.
            if (service.run == null) {
                throw new Error(
                    `A ${runnableType.name} service is not runnable.`);
            }
            this.runnables.push(service);
        }
        window.requestAnimationFrame(this.loopHelper);
    }

    gameLoop() {
        console.log("run");
        for (let runnable of this.runnables) {
            runnable.run();
        }
        window.requestAnimationFrame(this.loopHelper);
    }
}

interface RunnableService extends Service {
    run(): void;
}
