import type { RandomSeed } from "random-seed";
import { create } from "random-seed";

import type Maze from "app/models/maze";

/**
 * Subclasses can use any maze-generation algorithm to build the paths of a maze
 * @author adashrod@gmail.com
 */
export default abstract class MazeGenerator {
    private _seed: string;
    protected rng: RandomSeed = create();

    public abstract get name(): string;

    public abstract buildPaths(maze: Maze): void;

    public set seed(seed: number | string) {
        this._seed = seed.toString();
        this.rng = create(this._seed);
    }

    public get seed(): number | string {
        return this._seed;
    }
}
