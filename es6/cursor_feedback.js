/* @flow */

import {Component, EntityManager} from './entities.js';
import {RunnableGameService} from './game.js';
import {MOUSE_BUTTONS, InputManager} from './input.js';
import {PositionComponent} from './position.js';
import {VisibleComponent} from './graphics.js';
import {ViewportService} from './ui.js';
import {GridManager} from './grid.js';
import {StaticSpriteComponent, FillRectComponent} from './graphics.js';
import {ToolboxService, TOOLBOX_TOOLS} from './ui.js';
import {Color} from './color.js';
import * as config from './config.js';

const DELETE_COLOR = new Color(255, 0, 0, 150);

export class CursorFeedbackComponent extends Component {
}

export class CursorFeedbackService extends RunnableGameService {
    _entityManager: EntityManager;
    _inputManager: InputManager;
    _viewportService: ViewportService;
    _gridManager: GridManager;
    _toolbox: ToolboxService;

    subInit() {
        this._entityManager = this._game.getService(EntityManager);
        this._inputManager = this._game.getService(InputManager);
        this._viewportService = this._game.getService(ViewportService);
        this._gridManager = this._game.getService(GridManager);
        this._toolbox = this._game.getService(ToolboxService);
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
        if (!isOnElement) {
            return;
        }

        // Set size
        let sprite = cursorFollower.requireOtherComponent(StaticSpriteComponent);
        let fillRect = cursorFollower.requireOtherComponent(FillRectComponent);
        switch (this._toolbox.getSelectedTool()) {
        case TOOLBOX_TOOLS.BIG:
            sprite.isEnabled = true;
            fillRect.isEnabled = false;
            sprite.width = 32;
            sprite.height = 32;
            break;
        case TOOLBOX_TOOLS.SMALL:
            sprite.isEnabled = true;
            fillRect.isEnabled = false;
            sprite.width = 16;
            sprite.height = 16;
            break;
        case TOOLBOX_TOOLS.DELETE:
            sprite.isEnabled = false;
            fillRect.isEnabled = true;
            fillRect.color = DELETE_COLOR;
            break;
        default:
            sprite.isEnabled = false;
            fillRect.isEnabled = false;
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
