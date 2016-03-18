/* @flow */

import {EntityManager, Component} from './entities.js';
import {Color, CORNFLOWER_BLUE} from './color.js';
import {RunnableGameService} from './game.js';
import {ViewportService} from './ui.js';
import {PositionComponent} from './position.js';


export class RenderingService extends RunnableGameService {
    _viewportService: ViewportService;
    _entityManager: EntityManager;

    subInit() {
        this._viewportService = this._game.getService(ViewportService);
        this._entityManager = this._game.getService(EntityManager);
    }

    run() {
        let ctx = this._viewportService.getContext();
        let visibleEntities =
            this._entityManager.getComponentsByType(VisibleComponent);
        // Get other interesting components
        let renderables = visibleEntities.map((v) => {
            if (!v.isVisible) {
                return null;
            }
            let position = v.getOtherComponent(PositionComponent);
            if (!position) {
                return null;
            }
            let fillRect = v.getOtherComponent(FillRectComponent);
            if (fillRect && !fillRect.isEnabled) {
                fillRect = null;
            }
            let staticSprite = v.getOtherComponent(StaticSpriteComponent);
            if (staticSprite && !staticSprite.isEnabled) {
                staticSprite = null;
            }
            return {
                position: position,
                fillRect: fillRect,
                staticSprite: staticSprite
            };
        });
        // Sort so they overlap correctly
        renderables.sort((left, right) => {
            if (!left) {
                return -1;
            }
            if (!right) {
                return 1;
            }
            if (left.position.y < right.position.y) {
                return -1;
            }
            if (left.position.y === right.position.y) {
                return 0;
            }
            return 1;
        });
        // Render
        for (let renderable of renderables) {
            if (!renderable) {
                continue;
            }
            let position = renderable.position;

            // Render fill rect's
            let fillRect = renderable.fillRect;
            if (fillRect) {
                ctx.fillStyle = fillRect.color.toCss();
                ctx.fillRect(
                    position.x,
                    position.y - fillRect.height,
                    fillRect.width,
                    fillRect.height);
            }

            let sprite = renderable.staticSprite;
            if (sprite && sprite.image) {
                let image = sprite.image;
                let height = sprite.height || image.height;
                let width = sprite.width || image.width;
                ctx.drawImage(
                    sprite.image,
                    position.x,
                    position.y - height,
                    width,
                    height);
            }
        }
    }
}

export class ClearCanvasService extends RunnableGameService {
    _viewportService: ViewportService;
    _clearColor: Color;

    constructor(color: Color) {
        super();
        this._clearColor = color;
    }

    subInit() {
        this._viewportService = this._game.getService(ViewportService);
    }

    run() {
        let canvas = this._viewportService.getCanvas();
        let context = this._viewportService.getContext();
        context.fillStyle = this._clearColor.toCss();
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
}

export class DisableableComponent extends Component {
    isEnabled: boolean;

    constructor(entity: number, entityManager: EntityManager,
                args: Object) {
        super(entity, entityManager, args);
        if (args.isEnabled != null) {
            this.isEnabled = args.isEnabled;
        } else {
            this.isEnabled = true;
        }
    }
}

export class StaticSpriteComponent extends DisableableComponent {
    src: string;
    image: ?HTMLImageElement;
    width: ?number;
    height: ?number;
    isEnabled: boolean;

    constructor(entity: number, entityManager: EntityManager,
                args: {width: number, height: number, src: string,
                    isEnabled: boolean}) {
        super(entity, entityManager, args);

        this.width = args.width || null;
        this.height = args.height || null;

        if (args.src != null) {
            let image = new Image();
            image.src = args.src;
            image.addEventListener('load', () => {
                this.image = image;
            });
        }
    }
}

export class VisibleComponent extends Component {
    isVisible: boolean;

    constructor(entity: number, entityManager: EntityManager,
                args: {isVisible: boolean}) {
        super(entity, entityManager, args);
        this.isVisible = args.isVisible || true;
    }
}

export class FillRectComponent extends DisableableComponent {
    width: number;
    height: number;
    color: Color;

    constructor(entity: number, entityManager: EntityManager,
                args: {width: number, height: number, color: Color}) {
        super(entity, entityManager, args);
        this.width = args.width || 0;
        this.height = args.height || 0;
        this.color = (args.color || CORNFLOWER_BLUE).clone();
    }
}
