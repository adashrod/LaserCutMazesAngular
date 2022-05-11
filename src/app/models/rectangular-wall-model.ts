import type OrderedPair from "app/common/ordered-pair";
import type Direction from "app/direction";

/**
 * Similar to a {@link Maze}, this model is a grid-based representation of a maze. The difference is that this has grid
 * spaces for both path space and walls. Each space that represents part of a wall has information about whether it is
 * one or more ends of a wall or part of the middle.
 * @author adashrod@gmail.com
 */
export default class RectangularWallModel {
    public readonly walls: Wall[] = [];
    public readonly width: number;
    public readonly height: number;
    public readonly isWall: boolean[][] = [];

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        for (let y = 0; y < height; y++) {
            this.isWall.push([]);
            for (let x = 0; x < width; x++) {
                this.isWall[y].push(false);
            }
        }
    }

    public addWall(wall: Wall): RectangularWallModel {
        this.walls.push(wall);
        return this;
    }
}

export class Wall {
    public readonly start: OrderedPair<number>;
    public readonly end: OrderedPair<number>;
    public readonly length: number;
    public readonly wallDirection: Direction;

    public constructor(start: OrderedPair<number>, end: OrderedPair<number>, wallDirection: Direction) {
        this.start = start;
        this.end = end;
        this.length = Math.max(end.y - start.y + 1, end.x - start.x + 1);
        this.wallDirection = wallDirection;
    }
}
