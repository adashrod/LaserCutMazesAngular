import type OrderedPair from "app/common/ordered-pair";

/**
 * four directions for relating Spaces to each other
 */
export default class Direction {
    public static NORTH: Direction = new Direction("NORTH");
    public static EAST: Direction = new Direction("EAST");
    public static SOUTH: Direction = new Direction("SOUTH");
    public static WEST: Direction = new Direction("WEST");

    public readonly name: string;

    /**
     * Determines the direction that relates "from" to "to", e.g. if "to" is to the EAST of "from", EAST is returned
     */
    public static determineDirection(from: OrderedPair<number>, to: OrderedPair<number>): Direction {
        const xComp = from.x - to.x;
        if (xComp < 0) { return Direction.EAST; }
        if (xComp > 0) { return Direction.WEST; }
        const yComp = from.y - to.y;
        if (yComp < 0) { return Direction.SOUTH; }
        if (yComp > 0) { return Direction.NORTH; }
        throw new Error(`Indeterminate: the 2 OrderedPairs couldn't be compared: ${from.toString()}, ${to.toString()}`);
    }

    private constructor(name: string) {
        this.name = name;
    }

    public get opposite(): Direction {
        if (this === Direction.NORTH) {
            return Direction.SOUTH;
        }
        if (this === Direction.EAST) {
            return Direction.WEST;
        }
        if (this === Direction.SOUTH) {
            return Direction.NORTH;
        }
        if (this === Direction.WEST) {
            return Direction.EAST;
        }
        throw new Error("invalid direction");
    }

    public toString(): string {
        return this.name;
    }
}
