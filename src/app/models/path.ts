import Big from "big.js";

import OrderedPair from "app/common/ordered-pair";

export default class Path {
    readonly points: OrderedPair<Big>[] = [];
    isClosed: boolean = true;

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

    addPoint(point: OrderedPair<Big>): Path {
        this.points.push(point);
        return this;
    }

    setClosed(closed: boolean): Path {
        this.isClosed = closed;
        return this;
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
