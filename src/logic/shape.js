import { DIRECTIONS } from "./enums";

class Shape {
    constructor(data) {
        this.data = data;
        this.minX = Math.min.apply(null, data.map(r => r.indexOf(1)).filter(i => i > -1));
        this.maxX = Math.max.apply(null, data.map(r => r.slice().reverse().indexOf(1)).filter(i => i > -1));
        this.minY = data.map(r => r.indexOf(1) > -1).indexOf(true);
        this.maxY = data.slice().reverse().map(r => r.indexOf(1) > -1).indexOf(true);

        if (this.minX - this.maxX === 0) {
            this.direction = DIRECTIONS.HORIZONTAL;
            this.len = this.data.map(r => r.reduce((a, b) => a + b)).filter(x => x > 0)[0];
        } else {
            this.direction = DIRECTIONS.VERTICAL;
            this.len = this.data.map(r => r.indexOf(1) > -1 ? 1 : 0).reduce((a, b) => a + b);
        }
        console.log(this);
    }

    getCellPos(cursorPos) {
        let x, y;

        if (this.direction == DIRECTIONS.HORIZONTAL) {
            x = this.minX + cursorPos;
            y = this.minY;
        } else {
            x = this.minX;
            y = this.minY + cursorPos;
        }

        return { x, y };
    }
}

const SHAPES = [
    new Shape([
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 1, 1, 1, 1, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    ]),
    new Shape([
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    ]),
];

export {
    Shape,
    SHAPES
}