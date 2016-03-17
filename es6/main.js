/* @flow */

import 'babel-polyfill';
import {Game} from './game.js';
import {EntityManager} from './entities.js';
import {ViewportService} from './ui.js';
import {PositionComponent} from './position.js';
import {VisibleComponent, FillRectComponent, RenderingService} from './graphics.js';
import {CORNFLOWER_BLUE} from './color.js';

document.addEventListener('DOMContentLoaded', function() {
    if (document.readyState === 'interactive') {
        main();
    }
});

/**
 * The main program entry method. Executes after the DOM is ready to be
 * manipulated (but probably before it is rendered for the first time).
 */
function main() {
    let game = new Game();
    let entityManager = new EntityManager();
    game.addService(entityManager);
    game.addService(new RenderingService());
    game.addService(new ViewportService());

    entityManager.makeEntity([
        {type: VisibleComponent, args: {}},
        {type: PositionComponent, args: {}},
        {type: FillRectComponent, args: {
            width: 50, height: 50, color: CORNFLOWER_BLUE}}
    ]);

    game.start([RenderingService]);
}

//class CursorFeedbackComponent extends Component {
//    constructor(entity: number) {
//        super(entity);
//    }
//
//    update() {
//        let input = this._game.getInput();
//        if (!input.isMouseOnElement()) {
//            this._entity.setVisibility(false);
//            return;
//        }
//        this._entity.setVisibility(true);
//        let grid = this._game.getGrid();
//        let {x: gridX, y: gridY} = grid.pixelToGridCoords(
//            input.getMouseX(), input.getMouseY());
//        let {x: finalX, y: finalY} = grid.gridToPixelCoords(gridX, gridY);
//        this._entity.x = finalX;
//        this._entity.y = finalY;
//    }
//}
