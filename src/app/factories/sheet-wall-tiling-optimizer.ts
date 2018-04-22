import Big from "big.js";

import OrderedPair from "app/common/ordered-pair";
import { HALF, ZERO } from "app/misc/big-util";
import Shape from "app/models/shape";
import SheetWallModel from "app/models/sheet-wall-model";

/**
 * This class has an optimization function that tiles the walls in the sheet so that they're
 * - tiled in a way that fits within the max width and max height
 * - tiled in a way that wastes a minimal amount of space
 * @author adashrod@gmail.com
 */
export default class SheetWallTilingOptimizer {
    private sheetWallModel: SheetWallModel;
    private separationSpace: Big;
    private maxWidth: Big;
    private maxHeight: Big;
    private cursor = new OrderedPair<Big>(ZERO, ZERO);
    private beginningOfLineX: Big;
    private currentMaxRowWidth: Big | null;

    constructor(sheetWallModel: SheetWallModel, separationSpace: Big, maxWidth: Big, maxHeight: Big) {
        this.sheetWallModel = sheetWallModel;
        this.separationSpace = separationSpace;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
    }

    // todo: could make this even more efficient by doing rows instead of columns after the first column
    optimize(): void {
        const floorWidth = this.sheetWallModel.floorOutline.width,
            floorHeight = this.sheetWallModel.floorOutline.height,
            wallHeight = this.sheetWallModel.walls[0].height;
        this.cursor = new OrderedPair(ZERO, floorHeight);
        const shapesDeque = this.sheetWallModel.walls.slice();
        while (this.sheetWallModel.walls.length > 0) {
            this.sheetWallModel.walls.pop();
        }
        shapesDeque.sort((s1: Shape, s2: Shape) => s2.width.cmp(s1.width));
        this.beginningOfLineX = ZERO;
        this.currentMaxRowWidth = floorWidth;
        this.cursor.y = this.sheetWallModel.floorOutline.height.add(this.separationSpace);
        while (shapesDeque.length > 0) {
            if (this.fitsInNewRow(wallHeight)) {
                // add to new row in current column
                const longWall = shapesDeque.shift();
                if (typeof longWall === "undefined") {
                    throw new Error("shift() can't return undefined because the array length was checked just beforehand");
                }
                this.addToCurrentRow(longWall);
                // so that we don't overwrite cmrw when it's already been set to the floor width on the first iteration
                if (this.currentMaxRowWidth == null) {
                    this.currentMaxRowWidth = longWall.width;
                    if (this.cursor.x.add(this.currentMaxRowWidth).gt(this.maxWidth)) {
                        this.sheetWallModel.outOfBounds = true;
                    }
                }
            } else {
                // end of column reached, move right to new column
                this.cursor = new OrderedPair(this.cursor.x.add(this.currentMaxRowWidth || 0).add(this.separationSpace), ZERO);
                this.beginningOfLineX = this.cursor.x;
                this.currentMaxRowWidth = null;
                continue;
            }
            while (shapesDeque.length > 0) {
                const shortWall = shapesDeque[shapesDeque.length - 1];
                if (this.fitsInCurrentRow(shortWall)) {
                    this.addToCurrentRow(shortWall);
                    shapesDeque.pop();
                } else {
                    this.cursor = new OrderedPair(this.beginningOfLineX, this.cursor.y.add(wallHeight).add(this.separationSpace));
                    break;
                }
            }
        }
    }

    private addToCurrentRow(wall: Shape): void {
        wall.translate(this.cursor);
        const wallLabel = this.sheetWallModel.wallLabels.get(wall);
        if (typeof wallLabel === "undefined") {
            throw new Error(`You forgot to add a shape to the wallLabels map: ${wall.toString()}`);
        }
        wallLabel.translate(new OrderedPair(
            this.cursor.x.add(wall.width.mul(HALF)).sub(wallLabel.width.mul(HALF)),
            this.cursor.y.add(wall.height.mul(HALF)).sub(wallLabel.height.mul(HALF))
        ));
        this.sheetWallModel.walls.push(wall);
        this.cursor.x = this.cursor.x.add(wall.width.add(this.separationSpace));
    }

    private fitsInNewRow(wallHeight: Big): boolean {
        return this.cursor.y.add(wallHeight).lte(this.maxHeight);
    }

    private fitsInCurrentRow(wall: Shape): boolean {
        if (this.currentMaxRowWidth === null) {
            throw new Error("you shouldn't call fitsInCurrentRow when currentMaxRowWidth is null");
        }
        return this.cursor.x.sub(this.beginningOfLineX).add(wall.width).lte(this.currentMaxRowWidth);
    }
}
