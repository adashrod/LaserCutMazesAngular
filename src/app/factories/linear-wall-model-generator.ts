import OrderedPair from "app/common/ordered-pair";
import Direction from "app/direction";
import LinearWallModel, { Wall as LwmWall } from "app/models/linear-wall-model";
import type Maze from "app/models/maze";
import type Space from "app/models/space";

/**
 * An instance of LinearWallModelGenerator can be used to create a {@link LinearWallModel} from a {@link Maze}
 * @author adashrod@gmail.com
 */
export default class LinearWallModelGenerator {
    private maze: Maze;
    /**
     * if favorEwWalls is true, the generator will build east-west (horizontal) walls first, and north-south (vertical)
     * walls second; if false, vice-versa. The important difference is which wall will permeate through a plus-shaped
     * intersection of two long walls. The second wall built will be split at the intersection into 2 parts.
     * @return true for east-west, false for north-south
     */
    private favorEwWalls: boolean;

    public constructor(maze: Maze) {
        this.maze = maze;
    }

    public generate(): LinearWallModel {
        const width = this.maze.numCols;
        const height = this.maze.numRows;
        const lastCol = width - 1;
        const lastRow = height - 1;
        const linearWallModel = new LinearWallModel(width, height, this.favorEwWalls);

        if (this.favorEwWalls) {
            // make north walls of the rows
            for (let y = 0; y < height; y++) {
                this.makeWallsForLane(linearWallModel, y, width, false, Direction.NORTH, null, false);
            }
            // south wall of row
            this.makeWallsForLane(linearWallModel, lastRow, width, false, Direction.SOUTH, null, true);
            // make west walls of columns
            for (let x = 0; x < width; x++) {
                this.makeWallsForLane(linearWallModel, x, height, true, Direction.WEST, Direction.SOUTH, false);
            }
            // east wall of column
            this.makeWallsForLane(linearWallModel, lastCol, height, true, Direction.EAST, Direction.SOUTH, true);
        } else {
            // make west walls of columns
            for (let x = 0; x < width; x++) {
                this.makeWallsForLane(linearWallModel, x, height, true, Direction.WEST, null, false);
            }
            // east wall of column
            this.makeWallsForLane(linearWallModel, lastCol, height, true, Direction.EAST, null, true);
            // make north walls of the rows
            for (let y = 0; y < height; y++) {
                this.makeWallsForLane(linearWallModel, y, width, false, Direction.NORTH, Direction.EAST, false);
            }
            // south wall of row
            this.makeWallsForLane(linearWallModel, lastRow, width, false, Direction.SOUTH, Direction.EAST, true);
        }
        return linearWallModel;
    }

    /**
     * traverses a lane (row or column) of the maze, making as many walls that are needed for that lane, consolidating
     * adjacent walls when possible.
     * e.g. a row like ___ __ (3 spaces with walls, 1 empty, 2 more with walls)
     * This would make two walls; one 3 spaces long and the other 2 spaces long
     * e.g. when an overlapCheckDirection is used: ___|_
     *                                                |
     *     There's a wall 4 spaces long, and a perpendicular wall. If building vertical walls first, this horizontal
     *     wall would be split into 2 separate horizontal walls: one length 3, and one length 1, end-to-end, but separate
     *     so that the perpendicular wall doesn't overlap. If doing horizontal walls first, this would result in one
     *     horizontal wall 4 spaces long and two separate vertical walls.
     * @param linearWallModel            the model walls are being added to
     * @param majorTraversalIndex        the index of the lane being traversed
     * @param minorTraversalMax          number of spaces in the lane
     * @param xMajor                     true if doing an x-major (column-major) traversal
     * @param continuationCheckDirection direction to check that the wall continues, e.g. if doing a row-major traversal
     *                                   (moving east), one should check that there are walls on the north or south sides
     *                                   of the spaces to see how far they continue
     * @param overlapCheckDirection      direction to check for perpendicular walls, e.g. if doing a row-major traversal
     *                                   (moving east), one should check that there are perpendicular walls to the east
     *                                   which would determine the end of the current wall
     * @param isFinalWall                true if this is the last row/column being checked, used for determining
     *                                   coordinates since n rows means n+1 rows of horizontal walls
     */
    private makeWallsForLane(linearWallModel: LinearWallModel, majorTraversalIndex: number,
            minorTraversalMax: number, xMajor: boolean, continuationCheckDirection: Direction,
            overlapCheckDirection: Direction | null, isFinalWall: boolean): void {
        for (let i = 0; i < minorTraversalMax; i++) {
            const y = xMajor ? i : majorTraversalIndex;
            const x = xMajor ? majorTraversalIndex : i;
            const currentSpace = this.maze.grid[y][x];
            if (!currentSpace.isOpen(continuationCheckDirection)) {
                const lengthAndAdditive = this.calculateWallLength(xMajor, continuationCheckDirection,
                    overlapCheckDirection, isFinalWall, x, y);
                const length = lengthAndAdditive.x;
                const additive = lengthAndAdditive.y;
                linearWallModel.addWall(this.createWallHelper(xMajor, isFinalWall, x, y, length));
                i += length + additive;
            }
        }
    }

    private calculateWallLength(xMajor: boolean, continuationCheckDirection: Direction, overlapCheckDirection: Direction | null,
            isFinalWall: boolean, x: number, y: number): OrderedPair<number> {
        let length: number, additive = 0;
        for (length = 1; this.maze.isInBounds(xMajor ? x : x + length, xMajor ? y + length : y); length++) {
            // wall continuation check
            const nextSpace = this.findNextSpace(xMajor, x, y, length);
            if (nextSpace.isOpen(continuationCheckDirection)) {
                break;
            }
            // wall overlap check
            if (overlapCheckDirection != null) {
                const sameLaneX = this.findSameLaneX(xMajor, x, length), sameLaneY = this.findSameLaneY(xMajor, y, length);
                const prevLaneX = this.findPrevLaneX(xMajor, x, length), prevLaneY = this.findPrevLaneY(xMajor, y, length);
                const spaceInSameLane = this.maze.grid[sameLaneY][sameLaneX];
                const spaceInPrevLane = this.findSpaceInPrevLane(prevLaneX, prevLaneY);
                // 1st condition: check for perpendicular wall in same lane; 2nd: check for perpendicular wall
                // in prev lane, but not for row because we don't care about prev lane when doing the outer
                // check
                if (!spaceInSameLane.isOpen(overlapCheckDirection) ||
                        (!isFinalWall && spaceInPrevLane != null && !spaceInPrevLane.isOpen(overlapCheckDirection))) {
                    // i += length puts i just past the wall that's blocked by a perpendicular one; -1 is needed
                    // so that the next loop iter still checks that space after i++ happens
                    additive = -1;
                    break;
                }
            }
        }
        return new OrderedPair(length, additive);
    }

    private findNextSpace(xMajor: boolean, x: number, y: number, length: number): Space {
        return this.maze.grid[xMajor ? y + length : y][xMajor ? x : x + length];
    }

    private findSameLaneX(xMajor: boolean, x: number, length: number): number {
        return xMajor ? x : x + length - 1;
    }

    private findSameLaneY(xMajor: boolean, y: number, length: number): number {
        return xMajor ? y + length - 1 : y;
    }

    private findPrevLaneX(xMajor: boolean, x: number, length: number): number {
        return xMajor ? x - 1 : x + length - 1;
    }

    private findPrevLaneY(xMajor: boolean, y: number, length: number): number {
        return xMajor ? y + length - 1 : y - 1;
    }

    private findSpaceInPrevLane(prevLaneX: number, prevLaneY: number): Space | null {
        return this.maze.isInBounds(prevLaneX, prevLaneY) ? this.maze.grid[prevLaneY][prevLaneX] : null;
    }

    private createWallHelper(xMajor: boolean, isFinalWall: boolean, x: number, y: number, length: number): LwmWall {
        let startX: number, startY: number, endX: number, endY: number;
        if (xMajor) {
            startY = y;
            endY = y + length;
            if (isFinalWall) {
                startX = x + 1;
                endX = x + 1;
            } else {
                startX = x;
                endX = x;
            }
        } else {
            startX = x;
            endX = x + length;
            if (isFinalWall) {
                startY = y + 1;
                endY = y + 1;
            } else {
                startY = y;
                endY = y;
            }
        }
        const start = new OrderedPair(startX, startY), end = new OrderedPair(endX, endY);
        return new LwmWall(start, end);
    }
}
