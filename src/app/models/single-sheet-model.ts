import Big from "big.js";

import Shape from "app/models/shape";
import Path from "app/models/path";

export default class SingleSheetModel {
    readonly holes: Shape = new Shape();
    readonly floorOutline: Shape = new Shape();

    outOfBounds: boolean = false;

    addHole(path: Path): SingleSheetModel {
        this.holes.addPath(path);
        return this;
    }

    get maxHorizontalDisplacement(): Big {
        let max = this.floorOutline.maxHorizontalDisplacement;
        for (const shape of [this.holes, this.floorOutline]) {
            if (shape.maxHorizontalDisplacement.gt(max)) {
                max = shape.maxHorizontalDisplacement;
            }
        }
        return max;
    }

    get maxVerticalDisplacement(): Big {
        let max = this.floorOutline.maxVerticalDisplacement;
        for (const shape of [this.holes, this.floorOutline]) {
            if (shape.maxVerticalDisplacement.gt(max)) {
                max = shape.maxVerticalDisplacement;
            }
        }
        return max;
    }
}
