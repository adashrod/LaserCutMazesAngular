import OrderedPair from "app/common/ordered-pair";
import LinearWallModel, { Wall as LwmWall } from "app/models/linear-wall-model";
import RectangularWallModel, { Wall as RwmWall } from "app/models/rectangular-wall-model";
import Direction from "app/direction";

/**
 * An instance of RectangularWallModelGenerator can be used to create a {@link RectangularWallModel} from
 * a {@link LinearWallModel}
 * @author adashrod@gmail.com
 */
export default class RectangularWallModelGenerator {
    private model: LinearWallModel;
    private isWall: boolean[][] = [];

    constructor(model: LinearWallModel) {
        this.model = model;
        const r = 2 * model.height + 1, c = 2 * model.width + 1;
        for (let y = 0; y < r; y++) {
            this.isWall.push([]);
            for (let x = 0; x < c; x++) {
                this.isWall[y].push(false);
            }
        }
    }

    generate(): RectangularWallModel {
        const rectangularWallModel = new RectangularWallModel(this.isWall[0].length, this.isWall.length);

        const verticalWalls: LwmWall[] = [], horizontalWalls: LwmWall[] = [];
        for (const wall of this.model.walls) {
            const wallDirection = Direction.determineDirection(wall.start, wall.end);
            if (wallDirection === Direction.NORTH || wallDirection === Direction.WEST) {
                throw new Error("wall direction should only be EAST or SOUTH (start-to-end should be left-to-right or top-to-bottom): " +
                    wall.toString());
            }
            const isVertical = wallDirection === Direction.SOUTH;
            if (isVertical) {
                verticalWalls.push(wall);
            } else {
                horizontalWalls.push(wall);
            }
        }
        if (this.model.favorEwWalls) {
            this.createWallSpacesFromLinearWalls(rectangularWallModel, horizontalWalls, false, true);
            this.createWallSpacesFromLinearWalls(rectangularWallModel, verticalWalls, true, false);
        } else {
            this.createWallSpacesFromLinearWalls(rectangularWallModel, verticalWalls, true, true);
            this.createWallSpacesFromLinearWalls(rectangularWallModel, horizontalWalls, false, false);
        }

        return rectangularWallModel;
    }

    private createWallSpacesFromLinearWalls(rectangularWallModel: RectangularWallModel, walls: LwmWall[], wallsAreVertical: boolean,
            isFirstSetOfWalls: boolean): void {
        const endDirection = wallsAreVertical ? Direction.SOUTH : Direction.EAST;
        for (const wall of walls) {
            let wsx = wall.start.x * 2, wex = wall.end.x * 2, wsy = wall.start.y * 2, wey = wall.end.y * 2;
            if (!isFirstSetOfWalls) {
                if (wallsAreVertical) {
                    if (this.isWall[wsy][wsx]) { wsy++; }
                    if (this.isWall[wey][wex]) { wey--; }
                } else {
                    if (this.isWall[wsy][wsx]) { wsx++; }
                    if (this.isWall[wey][wex]) { wex--; }
                }
            }
            const rectWall = new RwmWall(new OrderedPair(wsx, wsy),
                new OrderedPair(wex, wey), endDirection);
            rectangularWallModel.addWall(rectWall);
            this.fillOutWallSpaces(wallsAreVertical, wsx, wsy, wex, wey);
        }
    }

    fillOutWallSpaces(wallsAreVertical: boolean, wsx: number, wsy: number, wex: number, wey: number): void {
        if (wallsAreVertical) {
            for (let y = wsy; y <= wey; y++) {
                this.isWall[y][wsx] = true;
            }
        } else {
            for (let x = wsx; x <= wex; x++) {
                this.isWall[wsy][x] = true;
            }
        }
    }
}
