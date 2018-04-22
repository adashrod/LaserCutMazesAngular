import OrderedPair from "app/common/ordered-pair";
import Direction from "app/direction";

export class Wall {
    start: OrderedPair<number>;
    end: OrderedPair<number>;

    constructor(a: OrderedPair<number>, b: OrderedPair<number>) {
        const direction = Direction.determineDirection(a, b);
        if (direction === Direction.NORTH || direction === Direction.WEST) {
            this.start = b;
            this.end = a;
        } else {
            this.start = a;
            this.end = b;
        }
    }

    toString(): string {
        return `Wall[${this.start.toString()} to ${this.end.toString()}]`;
    }
}

export default class LinearWallModel {
    readonly width: number;
    readonly height: number;
    readonly walls: Wall[] = [];
    readonly favorEwWalls: boolean;

    constructor(width: number, height: number, favorEwWalls: boolean) {
        this.width = width;
        this.height = height;
        this.favorEwWalls = favorEwWalls;
    }

    addWall(wall: Wall): void {
        this.walls.push(wall);
    }
}
