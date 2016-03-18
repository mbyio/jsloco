/* @flow */

import {Component, EntityManager} from './entities.js';
import {RunnableGameService} from './game.js';
import {InputManager} from './input.js';
import {PositionComponent} from './position.js';
import {VisibleComponent} from './graphics.js';
import {ViewportService} from './ui.js';
import {GridManager} from './grid.js';

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
    }
}
