import Direction from "app/direction";

/**
 * A Space represents an element in a 2D array representation of a maze. It knows whether it has walls on any four sides.
 * @author adashrod@gmail.com
 */
export default class Space {
    public northOpen: boolean = false;
    public eastOpen: boolean = false;
    public southOpen: boolean = false;
    public westOpen: boolean = false;

    /**
     * Removes a wall in the space
     * @param direction which wall to remove
     */
     public openWall(direction: Direction): void {
        this.changeWall(direction, true);
    }

    /**
     * Adds a wall in the space
     * @param direction which wall to add
     */
     public closeWall(direction: Direction): void {
        this.changeWall(direction, false);
    }

    private changeWall(direction: Direction, open: boolean): void {
        if (direction === Direction.NORTH) {
            this.northOpen = open;
        } else if (direction === Direction.EAST) {
            this.eastOpen = open;
        } else if (direction === Direction.SOUTH) {
            this.southOpen = open;
        } else if (direction === Direction.WEST) {
            this.westOpen = open;
        }
    }

    /**
     * @param direction which direction to check for a wall
     * @return true if the wall in the specified direction is open (no wall)
     */
     public isOpen(direction: Direction): boolean {
        switch (direction) {
            case Direction.NORTH:
                return this.northOpen;
            case Direction.EAST:
                return this.eastOpen;
            case Direction.SOUTH:
                return this.southOpen;
            case Direction.WEST:
                return this.westOpen;
            default:
                throw new Error(`invalid direction: ${direction}`);
        }
    }

    public toString(): string {
        let str = "Space[";
        if (this.northOpen) {
            str += "^";
        }
        if (this.eastOpen) {
            str += ">";
        }
        if (this.southOpen) {
            str += "v";
        }
        if (this.westOpen) {
            str += "<";
        }
        return str + "]";
    }
}
