/* @flow */

import 'babel-polyfill';
import {Game, RunnableGameService} from './game.js';
import {EntityManager, Component} from './entities.js';

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
    game.addService(new HelloWorldService());

    entityManager.makeEntity([
        {type: HelloWorldComponent, args: {}}
    ]);
    entityManager.makeEntity([
        {type: HelloWorldComponent, args: {}}
    ]);
    entityManager.makeEntity([
        {type: HelloWorldComponent, args: {}}
    ]);

    game.start([HelloWorldService]);
}

class HelloWorldComponent extends Component {
    constructor(entity: number) {
        super(entity);
    }
}

class HelloWorldService extends RunnableGameService {
    _entities: EntityManager;

    subInit() {
        this._entities = this._game.getService(EntityManager);
    }

    run() {
        let components = this._entities.getComponentsByType(HelloWorldComponent);
        for (let i = 0; i < components.length; i++) {
            let entity = components[i].getEntity();
            console.log(`Hello World from ${entity}.`);
        }
    }
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
