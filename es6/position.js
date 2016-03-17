/* @flow */

import {EntityManager, Component} from './entities.js';

export class PositionComponent extends Component {
    x: number;
    y: number;

    constructor(entity: number, entityManager: EntityManager,
                args: {x: number, y: number}) {
        super(entity, entityManager);
        this.x = args.x || 0;
        this.y = args.y || 0;
    }
}
