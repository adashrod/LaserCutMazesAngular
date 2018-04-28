import MazeGenerator from "app/algorithms/maze-generator";
import OrderedPair from "app/common/ordered-pair";
import Maze from "app/models/maze";
import Direction from "app/direction";

/**
 * An implementation of https://en.wikipedia.org/wiki/Prim%27s_algorithm for generating random 2D mazes with square
 * spaces
 * @author adashrod@gmail.com
 */
export default class PrimsAlgorithm extends MazeGenerator {
    private maze: Maze;
    private nextSpaces: OrderedPair<number>[] = [];
    // for onPath and exploringNext, using a map with stringified keys as a HashSet
    private onPath: Map<string, boolean> = new Map<string, boolean>();
    private exploringNext: Map<string, boolean> = new Map<string, boolean>();
    private deltas = [new OrderedPair<number>(0, -1), new OrderedPair<number>(1, 0),
        new OrderedPair<number>(0, 1), new OrderedPair<number>(-1, 0)];

    get name(): string {
        return "Prim's";
    }

    buildPaths(maze: Maze): void {
        this.maze = maze;
        this.onPath.clear();
        this.exploringNext.clear();
        this.markOnPathAndAddUnexploredNeighborsToNext(this.rng(maze.numCols), this.rng(maze.numRows));
        while (this.nextSpaces.length > 0) {
            const removed = this.nextSpaces.splice(this.rng(this.nextSpaces.length), 1)[0];
            const neighbors = this.findOnPathNeighbors(removed.x, removed.y);
            const randNeighbor = neighbors[this.rng(neighbors.length)];

            const direction = Direction.determineDirection(removed, randNeighbor);
            maze.grid[removed.y][removed.x].openWall(direction);
            maze.grid[randNeighbor.y][randNeighbor.x].openWall(direction.opposite);

            this.markOnPathAndAddUnexploredNeighborsToNext(removed.x, removed.y);
        }
    }

    private addToNextIfUnexplored(x: number, y: number): void {
        if (this.maze.isInBounds(x, y) && this.isUnexplored(x, y)) {
            this.exploringNext.set(new OrderedPair<number>(x, y).toString(), true);
            this.nextSpaces.push(new OrderedPair(x, y));
        }
    }

    private markOnPathAndAddUnexploredNeighborsToNext(x: number, y: number): void {
        this.onPath.set(new OrderedPair<number>(x, y).toString(), true);
        for (const delta of this.deltas) {
            this.addToNextIfUnexplored(x + delta.x, y + delta.y);        
        }
    }

    private findOnPathNeighbors(x: number, y: number): OrderedPair<number>[] {
        const n: OrderedPair<number>[] = [];
        for (const delta of this.deltas) {
            if (this.maze.isInBounds(x + delta.x, y + delta.y) && 
                    this.onPath.has(new OrderedPair<number>(x + delta.x, y + delta.y).toString())) {
                n.push(new OrderedPair<number>(x + delta.x, y + delta.y));
            }
        }
        return n;
    }

    private isUnexplored(x: number, y: number): boolean {
        const space = this.maze.grid[y][x];
        return !space.isOpen(Direction.NORTH) && !space.isOpen(Direction.EAST) && 
            !space.isOpen(Direction.SOUTH) && !space.isOpen(Direction.WEST) &&
            !this.exploringNext.has(new OrderedPair<number>(x, y).toString());
    }
}
