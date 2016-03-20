class Game {
    private loopWrapper: () => void;

    constructor() {
        this.loopWrapper = () => {
            this.gameLoop();
        };
        this.gameLoop();
    }

    private gameLoop() {
        console.log("Loop!");
        window.requestAnimationFrame(this.loopWrapper);
    }
}
