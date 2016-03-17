export class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toCSS(): string {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }

    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }
}

export const CORNFLOWER_BLUE = new Color(100, 149, 237, 255);
