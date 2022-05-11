import type Big from "big.js";

import type Path from "app/models/path";
import Shape from "app/models/shape";

export default class SingleSheetModel {
    public readonly holes: Shape = new Shape();
    public readonly floorOutline: Shape = new Shape();

    public outOfBounds: boolean = false;

    public addHole(path: Path): SingleSheetModel {
        this.holes.addPath(path);
        return this;
    }

    public get maxHorizontalDisplacement(): Big {
        let max = this.floorOutline.maxHorizontalDisplacement;
        for (const shape of [this.holes, this.floorOutline]) {
            if (shape.maxHorizontalDisplacement.gt(max)) {
                max = shape.maxHorizontalDisplacement;
            }
        }
        return max;
    }

    public get maxVerticalDisplacement(): Big {
        let max = this.floorOutline.maxVerticalDisplacement;
        for (const shape of [this.holes, this.floorOutline]) {
            if (shape.maxVerticalDisplacement.gt(max)) {
                max = shape.maxVerticalDisplacement;
            }
        }
        return max;
    }
}
