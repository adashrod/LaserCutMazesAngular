import MazeGenerator from "app/algorithms/maze-generator";
import Unit from "app/common/unit";

/**
 * a class for encapsulating all of the config needed for building a maze
 */
export default class MazeConfig {
    _numRows: number;
    _numCols: number;
    unit: Unit = Unit.INCHES;
    wallHeight: number = .5;
    materialThickness: number = .118;
    hallWidth: number = .5;
    separationSpace: number = .05;
    algorithm: MazeGenerator;
    private listeners: ((oldVal: any, newVal: any) => void)[] = [];

    get numRows(): number {
        return this._numRows;
    }

    set numRows(newVal: number) {
        const oldVal = this.numRows;
        this._numRows = newVal;
        if (oldVal !== newVal) {
            for (const l of this.listeners) {
                l(oldVal, newVal);
            }
        }
    }

    get numCols(): number {
        return this._numCols;
    }

    set numCols(newVal: number) {
        const oldVal = this.numCols;
        this._numCols = newVal;
        if (oldVal !== newVal) {
            for (const l of this.listeners) {
                l(oldVal, newVal);
            }
        }
    }

    addChangeListener(listener: (oldVal: any, newVal: any) => void): void {
        this.listeners.push(listener);
    }
}
