/// <reference path="services.ts" />
/// <reference path="util.ts" />
/// <reference path="es6-promise.d.ts" />

class ResourceManager implements Service {

    images: StringMap<Promise<HTMLImageElement>> = {};

    constructor(args: any) {
    }

    init(services: ServiceContainer) {
    }

    loadImage(src: string): Promise<HTMLImageElement> {
        if (this.images[src] != null) {
            return this.images[src];
        }
        return new Promise<HTMLImageElement>((resolve, reject) => {
            let img = new Image();
            img.src = src;
            img.addEventListener("load", () => {
                console.log(`Loaded ${src}.`);
                resolve(img);
            });
            img.addEventListener("error", (e) => {
                console.error(`Failed to load ${src}.`);
                reject(e);
            });
        });
    }
}
