import type Big from "big.js";

import Shape from "app/models/shape";
import type VectorNumber from "app/models/vector-number";

/**
 * This model class is a model of the walls and floor that compose a maze with the intention that each piece (wall or
 * floor) is of a constant thickness (the thickness of the physical sheet that will be used) and the walls will be
 * rotated upward and attached to the floor.
 * @author adashrod@gmail.com
 */
export default class SheetWallModel {
    public readonly floorNotches: Shape = new Shape();
    public readonly floorOutline: Shape = new Shape();
    public readonly walls: Shape[] = [];
    public readonly floorNumbers: VectorNumber[] = [];
    public readonly wallLabels: Map<Shape, VectorNumber> = new Map();  // reference equality is ok because there won't be any duplicate keys
                                                                // (1-to-1 walls and VectorNumbers)
    public outOfBounds: boolean;

    public addShape(shape: Shape): SheetWallModel {
        this.walls.push(shape);
        return this;
    }

    public get maxHorizontalDisplacement(): Big {
        let max = this.floorOutline.maxHorizontalDisplacement;
        for (const wall of this.walls) {
            if (wall.maxHorizontalDisplacement.gt(max)) {
                max = wall.maxHorizontalDisplacement;
            }
        }
        return max;
    }

    public get maxVerticalDisplacement(): Big {
        let max = this.floorOutline.maxVerticalDisplacement;
        for (const wall of this.walls) {
            if (wall.maxVerticalDisplacement.gt(max)) {
                max = wall.maxVerticalDisplacement;
            }
        }
        return max;
    }
}
