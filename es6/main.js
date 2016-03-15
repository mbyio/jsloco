/* @flow */

import 'babel-polyfill';
import {Game, Component} from './game.js';
import {SpriteComponent, FillRectComponent} from './graphics.js';

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
    let game = new Game([CursorFeedbackComponent]);
    let e = game.makeEntity();
    e.addComponent(new SpriteComponent('assets/lego-logo.jpg', 16, 16));
    e.x = 128; e.y = 128;
    let mouseFollow = game.makeEntity();
    mouseFollow.addComponent(new FillRectComponent('rgb(255,0,0)', 16, 16));
    mouseFollow.addComponent(new CursorFeedbackComponent());
    game.start();
}


class CursorFeedbackComponent extends Component {
    update() {
        let input = this._game.getInput();
        if (!input.isMouseOnElement()) {
            this._entity.setVisibility(false);
            return;
        }
        this._entity.setVisibility(true);
        let grid = this._game.getGrid();
        let {x: gridX, y: gridY} = grid.pixelToGridCoords(
            input.getMouseX(), input.getMouseY());
        let {x: finalX, y: finalY} = grid.gridToPixelCoords(gridX, gridY);
        this._entity.x = finalX;
        this._entity.y = finalY;
    }
}
