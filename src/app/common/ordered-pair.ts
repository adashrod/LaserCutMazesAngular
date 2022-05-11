import Big from "big.js";

/**
 * Dummy interface to prevent compiler warnings in OrderedPair#toString about toString not being defined on T. Should be
 * safe because anything that isn't null or undefined implements toString().
 */
interface ToString {
    toString(): string;
}

/**
 * A container for two numeric coordinates
 * @author adashrod@gmail.com
 */
export default class OrderedPair<T> {
    public x: T & ToString;
    public y: T & ToString;

    public constructor(x: T, y: T) {
        this.x = x;
        this.y = y;
    }

    public equals(aPair: OrderedPair<T>): boolean {
        if (this.x instanceof Big && this.y instanceof Big && aPair.x instanceof Big && aPair.y instanceof Big) {
            return this.x.eq(aPair.x) && this.y.eq(aPair.y);
        }
        return this.x === aPair.x && this.y === aPair.y;
    }

    public toString(): string {
        return `OrderedPair(${this.x?.toString()}, ${this.y?.toString()})`;
    }
}
