/* @flow */

import {EntityManager, Component} from './entities.js';
import {Color, CORNFLOWER_BLUE} from './color.js';
import {RunnableGameService} from './game.js';
import {ViewportService} from './ui.js';
import {PositionComponent} from './position.js';

export class VisibleComponent extends Component {
    isVisible: boolean;

    constructor(entity: number, entityManager: EntityManager,
                args: {isVisible: boolean}) {
        super(entity, entityManager);
        this.isVisible = args.isVisible || true;
    }
}

export class FillRectComponent extends Component {
    width: number;
    height: number;
    color: Color;

    constructor(entity: number, entityManager: EntityManager,
                args: {width: number, height: number, color: Color}) {
        super(entity, entityManager);
        this.width = args.width || 0;
        this.height = args.height || 0;
        this.color = (args.color || CORNFLOWER_BLUE).clone();
    }
}

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
            return {
                position: position,
                fillRect: v.getOtherComponent(FillRectComponent)
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
        for (let i = 0; i < renderables.length; i++) {
            let renderable = renderables[i];
            if (!renderable) {
                continue;
            }
            let position = renderable.position;
            let fillRect = renderable.fillRect;
            if (fillRect) {
                ctx.fillStyle = fillRect.color.toCSS();
                ctx.fillRect(
                    position.x,
                    position.y,
                    position.x + fillRect.width,
                    position.y + fillRect.height);
            }
        }
    }
}

//export class SpriteComponent extends Component {
//    _img: ?HTMLImageElement;
//    _width: number;
//    _height: number;
//
//    constructor(src: string, width: number, height: number) {
//        super();
//
//        let img = new Image();
//        img.src = src;
//        // If the image is loaded, assign it to _img; otherwise wait until it is
//        // loaded. Eventually this should be replaced with a real resource
//        // management system.
//        if (img.complete) {
//            this._img = img;
//        } else {
//            this._img = null;
//            img.addEventListener('load', () => {
//                this._img = img;
//            });
//        }
//
//        this._width = width;
//        this._height = height;
//    }
//
//    /**
//     * Get the sprite's image. Returns null/undefined if it isn't loaded yet.
//     */
//    getImage(): ?HTMLImageElement {
//        return this._img;
//    }
//
//    getWidth(): number {
//        return this._width;
//    }
//
//    getHeight(): number {
//        return this._height;
//    }
//}
