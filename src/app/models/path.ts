import Big from "big.js";

import OrderedPair from "app/common/ordered-pair";
import { ZERO } from "app/misc/big-util";

/**
 * A path is a set of points. The implication is that there is a line from point 0 to point 1, point 1 to
 * point 2, ..., point n - 1 to point n, and (if isClosed == true) point n to point 0
 */
export default class Path {
    readonly points: OrderedPair<Big>[] = [];
    isClosed: boolean = true;
    private cachedWidth: Big | null = null;
    private cachedHeight: Big | null = null;

    /**
     * if passed two arguments, creates an unclosed path from the first to the second
     * otherwise creates a closed path with no points to start
     * @param from start of path
     * @param to end of path
     */
    constructor(from?: OrderedPair<Big>, to?: OrderedPair<Big>) {
        if (typeof from !== "undefined" && typeof to !== "undefined") {
            this.points.push(from);
            this.points.push(to);
            this.isClosed = false;
        }
    }

    static copy(path: Path): Path {
        const pathCopy = new Path();
        for (const point of path.points) {
            pathCopy.addPoint(new OrderedPair(point.x, point.y));
        }
        pathCopy.setClosed(path.isClosed);
        return pathCopy;
    }

    addPoint(point: OrderedPair<Big>): Path {
        this.points.push(point);
        return this;
    }

    setClosed(closed: boolean): Path {
        this.isClosed = closed;
        return this;
    }

    get width(): Big {
        if (this.cachedWidth !== null) {
            return this.cachedWidth;
        }
        let minimum: Big | null = null, maximum: Big | null = null;
        for (const point of this.points) {
            if (minimum === null || point.x.lt(minimum)) {
                minimum = point.x;
            }
            if (maximum === null || point.x.gt(maximum)) {
                maximum = point.x;
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
        for (const point of this.points) {
            if (minimum === null || point.y.lt(minimum)) {
                minimum = point.y;
            }
            if (maximum === null || point.y.gt(maximum)) {
                maximum = point.y;
            }
        }
        if (maximum === null || minimum === null) {
            return ZERO;
        }
        return maximum.sub(minimum);
    }

    translate(delta: OrderedPair<Big>): Path {
        for (const point of this.points) {
            point.x = point.x.add(delta.x);
            point.y = point.y.add(delta.y);
        }
        return this;
    }

    toString(): string {
        let builder = "";
        for (const point of this.points) {
            builder += `(${point.x}, ${point.y}) -> `;
        }
        if (builder.length > 0) {
            builder = builder.substring(0, builder.length - 4);
        }
        return builder;
    }
}
