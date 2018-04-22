import { create, RandomSeed } from "random-seed";

import Maze from "app/models/maze";

/**
 * Subclasses can use any maze-generation algorithm to build the paths of a maze
 * @author adashrod@gmail.com
 */
export default abstract class MazeGenerator {
    _seed: string;
    protected rng: RandomSeed = create();

    abstract get name(): string;

    abstract buildPaths(maze: Maze): void;

    set seed(seed: number | string) {
        this._seed = seed.toString();
        this.rng = create(this._seed);
    }

    get seed(): number | string {
        return this._seed;
    }
}
