import OrderedPair from "app/common/ordered-pair";
import Direction from "app/direction";

export default class RectangularWallModel {
    readonly walls: Wall[] = [];
    readonly width: number;
    readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    addWall(wall: Wall): RectangularWallModel {
        this.walls.push(wall);
        return this;
    }
}

export class Wall {
    readonly start: OrderedPair<number>;
    readonly end: OrderedPair<number>;
    readonly length: number;
    readonly wallDirection: Direction;

    constructor(start: OrderedPair<number>, end: OrderedPair<number>, wallDirection: Direction) {
        this.start = start;
        this.end = end;
        this.length = Math.max(end.y - start.y + 1, end.x - start.x + 1);
        this.wallDirection = wallDirection;
    }
}
