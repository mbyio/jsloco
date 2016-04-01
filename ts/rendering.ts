/// <reference path="services.ts" />
/// <reference path="entities.ts" />
/// <reference path="position.ts" />
/// <reference path="gui.ts" />
/// <reference path="gameloop.ts" />
/// <reference path="util.ts" />

class Color {
    constructor(private _r: number,
                private _g: number,
                private _b: number,
                private _a: number) {
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

class Sprite {
    private _img: HTMLImageElement;
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;

    constructor(img: HTMLImageElement,
                x?: number,
                y?: number,
                width?: number,
                height?: number) {
        if (!img.complete || img.src == null || img.src.length === 0) {
            throw new Error("Image has not fully loaded.");
        }
        this._img = img;
        this._x = x || 0;
        this._y = y || 0;
        this._width = width || img.width;
        this._height = height || img.height;
    }

    get img(): HTMLImageElement {
        return this._img;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }
}

class RenderingComponent implements Component {
    /*
     * The time spent per frame in an animation (in milliseconds).
     */
    static TIME_PER_FRAME = 1 / 20 * 1000;

    tint: Color = null;
    public width: number;
    public height: number;

    private _currentAnimation: string = null;
    private animations: StringMap<Array<Sprite>> = {};
    private frameCounter = 0;
    private switchTime = new Date().getTime();

    addAnimation(name: string, animation: Array<Sprite>) {
        if (this.animations[name] != null) {
            throw new Error(
                `An animation with the name ${name} already exists.`);
        }
        if (animation.length === 0) {
            throw new Error(
                "An animation must consist of at least one sprite.");
        }
        this.animations[name] = animation;
    }

    switchTo(name: string) {
        if (this.animations[name] == null) {
            throw new Error(`No animation with the name ${name} exists.`);
        }
        this._currentAnimation = name;
        this.switchTime = new Date().getTime();
    }

    get sprite() {
        if (this._currentAnimation != null) {
            let animation = this.animations[this._currentAnimation];
            let time = new Date().getTime();
            let frame = Math.floor((
                    // Offset from when switchTo was called
                    (time - this.switchTime)
                    // Don't wrap around
                    % (RenderingComponent.TIME_PER_FRAME * animation.length))
                // Find out how many frame times have passed
                / RenderingComponent.TIME_PER_FRAME);
            return animation[frame];
        }
        return null;
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
        let ctx = this.viewport.ctx;
        let canvasWidth = ctx.canvas.width;
        let canvasHeight = ctx.canvas.height;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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

        for (let renderable of renderables) {
            let pos = renderable.require<PositionComponent>(PositionComponent);
            let render = renderable.require<RenderingComponent>(RenderingComponent);

            // Try to render a sprite
            let sprite = render.sprite;
            if (sprite != null) {
                ctx.drawImage(sprite.img,
                              sprite.x, sprite.y, sprite.width, sprite.height,
                              pos.x, pos.y, render.width, render.height);
            }
            // Try to render a tint
            if (render.tint != null) {
                ctx.fillStyle = render.tint.toCss();
                ctx.fillRect(pos.x, pos.y, render.width, render.height);
            }
        }
    }
}
