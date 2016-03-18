/* @flow */

import 'babel-polyfill';
import {Game} from './game.js';
import {EntityManager} from './entities.js';
import {ViewportService, ToolboxService} from './ui.js';
import {PositionComponent} from './position.js';
import {VisibleComponent, StaticSpriteComponent, RenderingService, ClearCanvasService, FillRectComponent} from './graphics.js';
import {CursorFeedbackComponent, CursorFeedbackService} from './cursor_feedback.js';
import {InputManager} from './input.js';
import {ARMY_GREEN} from './color.js';
import {GridManager} from './grid.js';
import * as config from './config.js';

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
    game.addService(new CursorFeedbackService());
    game.addService(new InputManager());
    game.addService(new ClearCanvasService(ARMY_GREEN));
    game.addService(new GridManager(
        config.GRID_WIDTH, config.GRID_HEIGHT, config.CELL_SIZE));
    game.addService(new ToolboxService());

    entityManager.makeEntity([
        {type: VisibleComponent, args: {}},
        {type: PositionComponent, args: {}},
        {type: StaticSpriteComponent, args: {
            src: 'assets/lego-logo.jpg', width: 16, height: 16}},
        {type: CursorFeedbackComponent, args: {}},
        {type: FillRectComponent, args: {width: 16, height: 16}}
    ]);

    game.start([CursorFeedbackService, ClearCanvasService, RenderingService]);
}
