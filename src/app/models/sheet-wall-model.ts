import Big from "big.js";

import Shape from "app/models/shape";
import VectorNumber from "app/models/vector-number";

/**
 * This model class is a model of the walls and floor that compose a maze with the intention that each piece (wall or
 * floor) is of a constant thickness (the thickness of the physical sheet that will be used) and the walls will be
 * rotated upward and attached to the floor.
 * @author adashrod@gmail.com
 */
export default class SheetWallModel {
    readonly floorNotches: Shape = new Shape();
    readonly floorOutline: Shape = new Shape();
    readonly walls: Shape[] = [];
    readonly floorNumbers: VectorNumber[] = [];
    readonly wallLabels: Map<Shape, VectorNumber> = new Map();  // reference equality is ok because there won't be any duplicate keys
                                                                // (1-to-1 walls and VectorNumbers)
    outOfBounds: boolean;

    addShape(shape: Shape): SheetWallModel {
        this.walls.push(shape);
        return this;
    }

    get maxHorizontalDisplacement(): Big {
        let max = this.floorOutline.maxHorizontalDisplacement;
        for (const wall of this.walls) {
            if (wall.maxHorizontalDisplacement.gt(max)) {
                max = wall.maxHorizontalDisplacement;
            }
        }
        return max;
    }

    get maxVerticalDisplacement(): Big {
        let max = this.floorOutline.maxVerticalDisplacement;
        for (const wall of this.walls) {
            if (wall.maxVerticalDisplacement.gt(max)) {
                max = wall.maxVerticalDisplacement;
            }
        }
        return max;
    }
}
