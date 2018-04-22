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

    get name(): string {
        return "Prim's";
    }

    buildPaths(maze: Maze): void {
        this.maze = maze;
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
        if (this.maze.isInBounds(x, y) && this.maze.grid[y][x].unexplored) {
            this.maze.grid[y][x].exploringNext = true;
            this.nextSpaces.push(new OrderedPair(x, y));
        }
    }

    private markOnPathAndAddUnexploredNeighborsToNext(x: number, y: number): void {
        this.maze.grid[y][x].onPath = true;
        this.addToNextIfUnexplored(x - 1, y);
        this.addToNextIfUnexplored(x + 1, y);
        this.addToNextIfUnexplored(x,     y - 1);
        this.addToNextIfUnexplored(x,     y + 1);
    }

    private findOnPathNeighbors(x: number, y: number): OrderedPair<number>[] {
        const n: OrderedPair<number>[] = [];
        if (this.maze.isInBounds(x - 1, y)     && this.maze.grid[y    ][x - 1].onPath) {
            n.push(new OrderedPair(x - 1, y));
        }
        if (this.maze.isInBounds(x + 1, y)     && this.maze.grid[y    ][x + 1].onPath) {
            n.push(new OrderedPair(x + 1, y));
        }
        if (this.maze.isInBounds(x,     y - 1) && this.maze.grid[y - 1][x    ].onPath) {
            n.push(new OrderedPair(x,     y - 1));
        }
        if (this.maze.isInBounds(x,     y + 1) && this.maze.grid[y + 1][x    ].onPath) {
            n.push(new OrderedPair(x,     y + 1));
        }
        return n;
    }
}
