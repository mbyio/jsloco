/* @flow */
/*global Class*/

import 'babel-polyfill';
import * as util from './util.js';

export class GameService {
    _game: Game;

    init(game: Game) {
        this._game = game;
        this.subInit();
    }

    subInit() {
    }
}

export class RunnableGameService extends GameService {
    run() {
    }
}

export class Game {
    _services: {[key: string]: GameService};
    _executionOrder: Array<string>;
    _running: boolean;

    constructor() {
        this._services = {};
        this._running = false;
    }

    addService(service: GameService) {
        let name = service.constructor.name;
        if (this._services[name] != null) {
            throw new Error(`A service of type ${name} is already present.`);
        }
        this._services[name] = service;
    }

    getService<T: GameService>(type: Class<T>): T {
        let service = this._services[type.name];
        if (service == null) {
            throw new Error(`No ${type.name} service found.`);
        }
        if (!(service instanceof type)) {
            throw new Error(`Service with name ${type.name} is not of that type.`);
        }
        return service;
    }

    start(executionOrder: Array<Object>) {
        if (this._running) {
            throw new Error('The game is already running.');
        }
        this._running = true;

        // Verify the execution order makes sense
        for (let i = 0; i < executionOrder.length; i++) {
            let serviceClass = executionOrder[i];
            if (serviceClass.name == null) {
                throw new Error('Object in execution order is not a class.');
            }
            let service = this._services[serviceClass.name];
            if (service == null) {
                throw new Error(`Service of type ${serviceClass.name} does not exist.`);
            }
            if (!(service instanceof serviceClass)) {
                throw new Error(`Object stored for ${serviceClass.name} service is not of the correct type.`);
            }
        }
        this._executionOrder = executionOrder.map((o) => o.name);

        // Init everything
        let allServices = util.mapValues(this._services);
        for (let i = 0; i < allServices.length; i++) {
            let service = allServices[i];
            service.init(this);
        }

        this._gameLoop();
    }

    _gameLoop() {
        for (let i = 0; i < this._executionOrder.length; i++) {
            let serviceName = this._executionOrder[i];
            let service = this._services[serviceName];
            if (service == null) {
                throw new Error('Service in execution order not found.');
            }
            if (!(service instanceof RunnableGameService)) {
                throw new Error('Service in execution order is not runnable.');
            }
            service.run();
        }
        window.requestAnimationFrame(this._gameLoop.bind(this));
    }
}
