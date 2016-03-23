/// <reference path="game.ts" />

document.addEventListener("DOMContentLoaded", function() {
    if (document.readyState === "interactive") {
        main();
    }
});

function main() {
    let game = new Game();
    let testEntity = game.makeEntity();
}

class HelloWorldService implements RunnableGameService {
    constructor(private game: Game, args: any) {
    }
}
