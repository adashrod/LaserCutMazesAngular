import type Big from "big.js";

import type OrderedPair from "app/common/ordered-pair";

/**
 * An SVG <path/> element
 * @author adashrod@gmail.com
 */
export default class Path {
    public style = "stroke:#000000;fill:none";
    public start: OrderedPair<Big>;
    public end: OrderedPair<Big>;
    public id: string;
    public readonly multiPartPath: OrderedPair<Big>[] = [];

    public constructor(start?: OrderedPair<Big>, end?: OrderedPair<Big>) {
        if (typeof start !== "undefined" && typeof end !== "undefined") {
            this.start = start;
            this.end = end;
        }
    }

    public toString(): string {
        return `Path[(${this.start.x},${this.start.y}) -> (${this.end.x},${this.end.y}]`;
    }
}
