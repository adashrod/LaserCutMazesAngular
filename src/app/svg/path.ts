import Big from "big.js";

import OrderedPair from "app/common/ordered-pair";

/**
 * An SVG <path/> element
 * @author adashrod@gmail.com
 */
export default class Path {
    style = "stroke:#000000;fill:none";
    start: OrderedPair<Big>;
    end: OrderedPair<Big>;
    id: string;
    readonly multiPartPath: OrderedPair<Big>[] = [];

    constructor(start?: OrderedPair<Big>, end?: OrderedPair<Big>) {
        if (typeof start !== "undefined" && typeof end !== "undefined") {
            this.start = start;
            this.end = end;
        }
    }

    toString(): string {
        return `Path[(${this.start.x},${this.start.y}) -> (${this.end.x},${this.end.y}]`;
    }
}
