/* @flow */

import {Component, EntityManager} from './entities.js';
import {RunnableGameService} from './game.js';
import {MOUSE_BUTTONS, InputManager} from './input.js';
import {PositionComponent} from './position.js';
import {VisibleComponent} from './graphics.js';
import {ViewportService} from './ui.js';
import {GridManager} from './grid.js';
import {StaticSpriteComponent} from './graphics.js';
import * as config from './config.js';

export class CursorFeedbackComponent extends Component {
}

export class CursorFeedbackService extends RunnableGameService {
    _entityManager: EntityManager;
    _inputManager: InputManager;
    _viewportService: ViewportService;
    _gridManager: GridManager;

    subInit() {
        this._entityManager = this._game.getService(EntityManager);
        this._inputManager = this._game.getService(InputManager);
        this._viewportService = this._game.getService(ViewportService);
        this._gridManager = this._game.getService(GridManager);
    }

    run() {
        let cursorFollower =
            this._entityManager.getComponentByType(CursorFeedbackComponent);
        if (cursorFollower == null) {
            return;
        }

        // Set visibility
        let isOnElement = this._inputManager.isMouseOnElement();
        let visibleComponent =
            cursorFollower.getOtherComponent(VisibleComponent);
        if (visibleComponent != null) {
            visibleComponent.isVisible = isOnElement;
        }

        // Set position
        let position = cursorFollower.getOtherComponent(PositionComponent);
        if (!position || !isOnElement) {
            return;
        }

        let {x: gridX, y: gridY} = this._gridManager.pixelToGridCoords(
            this._inputManager.getMouseX(),
            this._inputManager.getMouseY());
        let {x: realX, y: realY} =
            this._gridManager.gridToPixelCoords(gridX, gridY);
        position.x = realX;
        position.y = realY;

        // Handle mouse clicks
        if (this._inputManager.getMouseButtonState(MOUSE_BUTTONS.LEFT) &&
                this._gridManager.isAreaEmpty(gridX, gridY, 1, 1)) {
            console.log(`RealX: ${realX}, RealY: ${realY}`);
            let e = this._entityManager.makeEntity([
                {type: VisibleComponent, args: {}},
                {type: PositionComponent, args: {x: realX, y: realY}},
                {type: StaticSpriteComponent, args: {
                    src: 'assets/lego-logo.jpg',
                    width: config.CELL_SIZE, height: config.CELL_SIZE}}
            ]);
            this._gridManager.set(gridX, gridY, 1, 1, e);
        }
    }
}
