import type MazeGenerator from "app/algorithms/maze-generator";
import Space from "app/models/space";

/**
 * This maze class is a representation of a maze based on a grid of squares. Each square knows about the four walls
 * surrounding it.
 * @author adashrod@gmail.com
 */
export default class Maze {
    public readonly numCols: number;
    public readonly numRows: number;
    public readonly grid: Space[][] = [];

    public constructor(numCols: number, numRows: number) {
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = [];
        this.initGrid();
    }

    private initGrid(): void {
        for (let y = 0; y < this.numRows; y++) {
            this.grid.push([]);
            for (let x = 0; x < this.numCols; x++) {
                this.grid[y].push(new Space());
            }
        }
    }

    private resetGrid(): void {
        for (let y = 0; y < this.numRows; y++) {
            for (let x = 0; x < this.numCols; x++) {
                this.grid[y][x] = new Space();
            }
        }
    }

    /**
     * check if a space determined by the coordinates is inside the maze boundary
     */
    public isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.numCols && y >= 0 && y < this.numRows;
    }

    /**
     * Randomizes this maze using the supplied algorithm
     * @param generatorAlgorithm which algorithm to use
     */
    public build(generatorAlgorithm: MazeGenerator): void {
        this.resetGrid();
        generatorAlgorithm.buildPaths(this);
    }
}
