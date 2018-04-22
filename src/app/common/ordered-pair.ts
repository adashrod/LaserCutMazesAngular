import Big from "big.js";

/**
 * A container for two numeric coordinates
 * @author adashrod@gmail.com
 */
export default class OrderedPair<T> {
    x: T;
    y: T;

    constructor(x: T, y: T) {
        this.x = x;
        this.y = y;
    }

    equals(aPair: OrderedPair<T>): boolean {
        if (this.x instanceof Big && this.y instanceof Big && aPair.x instanceof Big && aPair.y instanceof Big) {
            return this.x.eq(aPair.x) && this.y.eq(aPair.y);
        }
        return this.x === aPair.x && this.y === aPair.y;
    }

    toString(): string {
        return `OrderedPair(${this.x.toString()}, ${this.y.toString()})`;
    }
}
