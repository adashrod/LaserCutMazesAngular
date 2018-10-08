import OrderedPair from "app/common/ordered-pair";
import Direction from "app/direction";

/**
 * A wall within a LinearWallModel. The model is a 2D top-down representation of a maze. Walls have no depth
 */
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

/**
 * This model class is a representation of a maze based on a list of walls. Each wall has a start point and end point.
 * The walls should not intersect and cross; they should only intersect end-to-end with T- and L-shaped intersections.
 * A 4-way intersection should always consist of three walls. T-shaped intersections should be split into 3 parts if the
 * part of the intersection analogous to the top of the letter T is not in the favored direction
 * @author adashrod@gmail.com
 */
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
