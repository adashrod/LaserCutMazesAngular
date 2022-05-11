import MazeGenerator from "app/algorithms/maze-generator";
import type Maze from "app/models/maze";

export default class EmptyAlgorithm extends MazeGenerator {
    public readonly name: string = "Do-It-Yourself";

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public buildPaths(maze: Maze): void {}
}
