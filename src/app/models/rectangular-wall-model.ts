import OrderedPair from "app/common/ordered-pair";
import Direction from "app/direction";

/**
 * Similar to a {@link Maze}, this model is a grid-based representation of a maze. The difference is that this has grid
 * spaces for both path space and walls. Each space that represents part of a wall has information about whether it is
 * one or more ends of a wall or part of the middle.
 * @author adashrod@gmail.com
 */
export default class RectangularWallModel {
    readonly walls: Wall[] = [];
    readonly width: number;
    readonly height: number;
    public readonly isWall: boolean[][] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        for (let y = 0; y < height; y++) {
            this.isWall.push([]);
            for (let x = 0; x < width; x++) {
                this.isWall[y].push(false);
            }
        }
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
