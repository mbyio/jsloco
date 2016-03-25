/// <reference path="services.ts" />
/// <reference path="entities.ts" />
/// <reference path="position.ts" />
/// <reference path="gui.ts" />
/// <reference path="gameloop.ts" />

class Color {
    private _r: number;
    private _g: number;
    private _b: number;
    private _a: number;

    constructor(r?: number, g?: number, b?: number, a?: number) {
        this.r = r || 255;
        this.g = g || 255;
        this.b = b || 255;
        this.a = a || 255;
    }

    get r() {
        return this._r;
    }

    set r(v: number) {
        if (v < 0 || v > 255) {
            throw new Error("r value out of range.");
        }
        this._r = Math.floor(v);
    }

    get g() {
        return this._g;
    }

    set g(v: number) {
        if (v < 0 || v > 255) {
            throw new Error("g value out of range.");
        }
        this._g = Math.floor(v);
    }

    get b() {
        return this._b;
    }

    set b(v: number) {
        if (v < 0 || v > 255) {
            throw new Error("b value out of range.");
        }
        this._b = Math.floor(v);
    }

    get a() {
        return this._a;
    }

    set a(v: number) {
        if (v < 0 || v > 255) {
            throw new Error("a value out of range.");
        }
        this._a = Math.floor(v);
    }

    toCss() {
        return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
    }

    static makeRandomRGB(): Color {
        return new Color(
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            255);
    }
}

class RenderingComponent implements Component {

    tintColor: Color = null;
    _width: number;
    _height: number;

    get width() {
        return this._width;
    }

    set width(v: number) {
        if (v < 0) {
            throw new Error("Width must be positive.");
        }
        this._width = v;
    }

    get height() {
        return this._height;
    }

    set height(v: number) {
        if (v < 0) {
            throw new Error("Height must be positive.");
        }
        this._height = v;
    }
}

class RenderingService implements RunnableService {
    private entities: EntityService;
    private viewport: ViewportService;

    constructor(args: any) {
    }

    init(services: ServiceContainer) {
        this.entities = services.require<EntityService>(EntityService);
        this.viewport = services.require<ViewportService>(ViewportService);
    }

    run() {
        let renderables = this.entities.getEntitiesWithComponents([
            PositionComponent, RenderingComponent]);

        // sort by x
        renderables.sort((a, b) => {
            let aPos = a.require<PositionComponent>(PositionComponent);
            let bPos = b.require<PositionComponent>(PositionComponent);
            if (aPos.x < bPos.x) {
                return -1;
            } else {
                return 1;
            }
        });

        // sort by y
        renderables.sort((a, b) => {
            let aPos = a.require<PositionComponent>(PositionComponent);
            let bPos = b.require<PositionComponent>(PositionComponent);
            if (aPos.y < bPos.y) {
                return -1;
            } else if (aPos.y === bPos.y) {
                return 0;
            } else {
                return 1;
            }
        });

        let ctx = this.viewport.ctx;
        for (let renderable of renderables) {
            let pos = renderable.require<PositionComponent>(PositionComponent);
            let render = renderable.require<RenderingComponent>(RenderingComponent);
            if (render.tintColor != null) {
                ctx.fillStyle = render.tintColor.toCss();
                ctx.fillRect(pos.x, pos.y, render.width, render.height);
            }
        }
    }
}
