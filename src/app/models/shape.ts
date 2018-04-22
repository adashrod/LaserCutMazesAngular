import Big from "big.js";

import OrderedPair from "app/common/ordered-pair";
import { ZERO } from "app/misc/big-util";
import Path from "app/models/path";

export default class Shape {
    readonly paths: Path[] = [];
    private cachedWidth: Big | null = null;
    private cachedHeight: Big | null = null;

    /**
     * if passed one argument, creates a new shape with that one path
     * if passed no arguments, creates an empty Shape
     * @param path optional path
     */
    constructor(path?: Path) {
        if (typeof path !== "undefined") {
            this.paths.push(path);
        }
    }

    static copy(shape: Shape): Shape {
        const copy = new Shape();
        for (const path of shape.paths) {
            const pathCopy = new Path();
            for (const point of path.points) {
                pathCopy.addPoint(new OrderedPair(point.x, point.y));
            }
            pathCopy.setClosed(path.isClosed);
            copy.addPath(pathCopy);
        }
        return copy;
    }

    addPath(path: Path): Shape {
        this.paths.push(path);
        this.cachedWidth = null;
        this.cachedHeight = null;
        return this;
    }

    addShape(shape: Shape): Shape {
        Array.prototype.push.apply(this.paths, shape.paths);
        this.cachedWidth = null;
        this.cachedHeight = null;
        return this;
    }

    get width(): Big {
        if (this.cachedWidth !== null) {
            return this.cachedWidth;
        }
        let minimum: Big | null = null, maximum: Big | null = null;
        for (const path of this.paths) {
            for (const point of path.points) {
                if (minimum === null || point.x.lt(minimum)) {
                    minimum = point.x;
                }
                if (maximum === null || point.x.gt(maximum)) {
                    maximum = point.x;
                }
            }
        }
        if (maximum === null || minimum === null) {
            return ZERO;
        }
        return maximum.sub(minimum);
    }

    get height(): Big {
        if (this.cachedHeight !== null) {
            return this.cachedHeight;
        }
        let minimum: Big | null = null, maximum: Big | null = null;
        for (const path of this.paths) {
            for (const point of path.points) {
                if (minimum === null || point.y.lt(minimum)) {
                    minimum = point.y;
                }
                if (maximum === null || point.y.gt(maximum)) {
                    maximum = point.y;
                }
            }
        }
        if (maximum === null || minimum === null) {
            return ZERO;
        }
        return maximum.sub(minimum);
    }

    translate(delta: OrderedPair<Big>): Shape {
        for (const path of this.paths) {
            path.translate(delta);
        }
        return this;
    }

    /**
     * for now, at least, this assumes that the object is positioned at 0,0. If that's not the case, this will also end
     * up doing an unwanted translation
     * @param scaleFactor
     * @return
     */
    scale(scaleFactor: OrderedPair<Big>): Shape {
        for (const path of this.paths) {
            for (const point of path.points) {
                point.x = point.x.mul(scaleFactor.x);
                point.y = point.y.mul(scaleFactor.y);
            }
        }
        return this;
    }

    toString(): string {
        let result = "Shape[";
        if (this.paths.length > 0) {
            for (const p of this.paths) {
                result += p.toString() + ", ";
            }
            result = result.substring(0, result.length - 2);
        }
        return result + "]";
    }
}
