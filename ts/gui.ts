/// <reference path="services.ts" />
/// <reference path="util.ts" />

class ViewportService implements Service {

    private _width: number;
    private _height: number;
    private _viewportContainer: HTMLElement;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    constructor(args: any) {
        let width = args.width;
        if (typeof width !== "number") {
            throw new Error("Width must be a number.");
        } else if (width < 0) {
            throw new Error("Width must be positive.");
        }
        this._width = width;

        let height = args.height;
        if (typeof height !== "number") {
            throw new Error("Height must be a number.");
        } else if (height < 0) {
            throw new Error("Height must be positive.");
        }
        this._height = height;

        let viewportContainer = document.getElementById(args.id);
        if (viewportContainer == null ||
                !(viewportContainer instanceof HTMLElement)) {
            throw new Error("Invalid viewport container (id?).");
        }
        this._viewportContainer = viewportContainer;
    }

    init(services: ServiceContainer) {
        let canvas = document.createElement("canvas");
        this._canvas = canvas;
        this._viewportContainer.appendChild(canvas);

        let ctx = canvas.getContext("2d");
        this._ctx = ctx;

        canvas.width = this._width;
        canvas.height = this._height;
        this._viewportContainer.style.backgroundImage =
            "url('assets/shitty_grass_tile.png')";
        this._viewportContainer.style.position = "relative";
        this._viewportContainer.style.width = `${this._width}px`;
        this._viewportContainer.style.height = `${this._height}px`;
    }

    get height() {
        return this._height;
    }

    get width() {
        return this._width;
    }

    get ctx() {
        return this._ctx;
    }
}
