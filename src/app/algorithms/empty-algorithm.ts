import MazeGenerator from "app/algorithms/maze-generator";
import Maze from "app/models/maze";

export default class EmptyAlgorithm extends MazeGenerator {
    readonly name: string = "Do-It-Yourself";

    buildPaths(maze: Maze): void {}
}
