import MazeGenerator from "app/algorithms/maze-generator";
import Unit from "app/common/unit";

/**
 * a class for encapsulating all of the config needed for building a maze
 */
export default class MazeConfig {
    numRows: number = 8;
    numCols: number = 8;
    unit: Unit = Unit.INCHES;
    wallHeight: number = .5;
    materialThickness: number = .118;
    hallWidth: number = .5;
    notchHeight: number = .2;
    separationSpace: number = .05;
    algorithm: MazeGenerator;
}
