/// <reference path="entities.ts" />

class PositionComponent implements Component {

    x: number = 0;
    y: number = 0;

    constructor(entity: Entity, services: ServiceContainer) {
    }
}
