import MazeGenerator from "app/algorithms/maze-generator";
import OrderedPair from "app/common/ordered-pair";
import Maze from "app/models/maze";
import Direction from "app/direction";

export default class DepthFirstSearchAlgorithm extends MazeGenerator {
    private maze: Maze;
    private explored: Map<string, boolean> = new Map<string, boolean>(); // using a map with stringified keys as a HashSet
    private deltas = [new OrderedPair<number>(0, -1), new OrderedPair<number>(1, 0),
        new OrderedPair<number>(0, 1), new OrderedPair<number>(-1, 0)];

    get name(): string {
        return "Depth-First Search";
    }

    buildPaths(maze: Maze): void {
        this.maze = maze;
        this.explored.clear();
        const stack: OrderedPair<number>[] = [];
        let current = new OrderedPair<number>(this.rng(maze.numCols), this.rng(maze.numRows));
        this.explored.set(new OrderedPair<number>(current.x, current.y).toString(), true);
        const numSpaces = maze.numRows * maze.numCols;
        while (this.explored.size < numSpaces) {
            const neighbors = this.findUnexploredNeighbors(current.x, current.y);
            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[this.rng(neighbors.length)];
                stack.push(current);
                const direction = Direction.determineDirection(current, randomNeighbor);
                maze.grid[current.y][current.x].openWall(direction);
                maze.grid[randomNeighbor.y][randomNeighbor.x].openWall(direction.opposite);
                current = randomNeighbor;
                this.explored.set(new OrderedPair<number>(current.x, current.y).toString(), true);
            } else {
                if (stack.length === 0) {
                    break;
                }
                current = <OrderedPair<number>>stack.pop();
            }
        }
    }

    private findUnexploredNeighbors(x: number, y: number): OrderedPair<number>[] {
        const neighbors: OrderedPair<number>[] = [];
        for (const delta of this.deltas) {
            if (this.maze.isInBounds(x + delta.x, y + delta.y) &&
                    !this.explored.has(new OrderedPair<number>(x + delta.x, y + delta.y).toString())) {
                neighbors.push(new OrderedPair<number>(x + delta.x, y + delta.y));
            }
        }
        return neighbors;
    }
}
