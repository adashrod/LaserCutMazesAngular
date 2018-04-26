import Big from "big.js";

import OrderedPair from "app/common/ordered-pair";
import SheetWallTilingOptimizer from "app/factories/sheet-wall-tiling-optimizer";
import { min, HALF, ZERO } from "app/misc/big-util";
import Path from "app/models/path";
import RectangularWallModel, { Wall as RwmWall } from "app/models/rectangular-wall-model";
import Shape from "app/models/shape";
import SheetWallModel from "app/models/sheet-wall-model";
import VectorNumber from "app/models/vector-number";
import Direction from "app/direction";

class NotchPosInfo {
    direction: Direction;
    isCorner: boolean;

    constructor(direction: Direction, isCorner: boolean) {
        this.direction = direction;
        this.isCorner = isCorner;
    }
}

class NotchConnection {
    firstPoint: OrderedPair<Big>;
    cornerPoint: OrderedPair<Big>;
    secondPoint: OrderedPair<Big>;

    constructor(firstPoint: OrderedPair<Big>, cornerPoint: OrderedPair<Big>, secondPoint: OrderedPair<Big>) {
        this.firstPoint = firstPoint;
        this.cornerPoint = cornerPoint;
        this.secondPoint = secondPoint;
    }
}

export default class SheetWallModelGenerator {
    private static directionRank = createDirectionRankMap();

    wallHeight: Big;
    materialThickness: Big;
    hallWidth: Big;
    notchHeight: Big;
    separationSpace: Big;
    maxWidth: Big;
    maxHeight: Big;
    private notchEdgeMap: Map<Path, NotchPosInfo> = new Map(); // reference equality is ok because there won't be any duplicate keys
                                    // (1-to-1 notches and notch metadata)
    private model: RectangularWallModel;
    private wallTypeLabelsByLength: Map<string, number> = new Map(); // reference equality won't work because this map is being used as a
                                    // cache and keys are recalculated on every get; call toString() on them for cache hits

    constructor(model: RectangularWallModel) {
        this.model = model;
    }

    public generate(): SheetWallModel {
        const sheetWallModel = new SheetWallModel();

        // for now, all walls and the floor will be positioned at (0,0). They'll be translated and tiled on the
        // print sheet later
        const sortedWalls = this.model.walls.slice(0);
        sortedWalls.sort((a: RwmWall, b: RwmWall) => a.length - b.length);
        for (const wall of sortedWalls) {
            const wallLength = this.createNotchesForWall(wall, sheetWallModel);
            const wallPath = new Path()
                .addPoint(new OrderedPair(ZERO, ZERO))
                .addPoint(new OrderedPair(wallLength, ZERO))
                .addPoint(new OrderedPair(wallLength, this.wallHeight.add(this.materialThickness)))
                .addPoint(new OrderedPair(wallLength.sub(this.notchHeight), this.wallHeight.add(this.materialThickness)))
                .addPoint(new OrderedPair(wallLength.sub(this.notchHeight), this.wallHeight))
                .addPoint(new OrderedPair(this.notchHeight, this.wallHeight))
                .addPoint(new OrderedPair(this.notchHeight, this.wallHeight.add(this.materialThickness)))
                .addPoint(new OrderedPair(ZERO, this.wallHeight.add(this.materialThickness)));
            const wallShape = new Shape(wallPath);
            sheetWallModel.addShape(wallShape);
            const wallTypeLabel = this.findWallTypeLabel(wallLength);
            const vnHeight = this.wallHeight.mul(HALF),
                vnWidth = vnHeight.mul(HALF).mul(this.numDigits(wallTypeLabel));
            sheetWallModel.wallLabels.set(wallShape, new VectorNumber(wallTypeLabel, min(vnWidth, wallLength), vnHeight,
                new OrderedPair(ZERO, ZERO))); // translate in optimizer
        }
        this.createOutline(sheetWallModel);
        new SheetWallTilingOptimizer(sheetWallModel, this.separationSpace, this.maxWidth, this.maxHeight, this.wallHeight).optimize();
        return sheetWallModel;
    }

    /**
     * given an index of a grid cell, calculates the physical distance to the start (left or top) of that cell from the
     * beginning of the floor
     * @param index   the grid index of the start/end cap of the wall
     * @return the left x displacement of the notch for horizontal displacements or the top y displacement for vertical
     * displacements
     */
    private calcDisplacement(index: number): Big {
        const mtFactor = Math.floor((index + 1) / 2),
            hwFactor = Math.floor(index / 2);
        return this.materialThickness.mul(mtFactor).add(this.hallWidth.mul(hwFactor));
    }

    private createNotchesForWall(wall: RwmWall, sheetWallModel: SheetWallModel): Big {
        // notches in the floor for the wall tabs to fit into
        const firstNotch = new Path(), secondNotch = new Path();
        let wallLength: Big;
        let vectorNumber: VectorNumber;
        if (wall.wallDirection === Direction.EAST) {
            wallLength = this.calcDisplacement(wall.end.x + 1).sub(this.calcDisplacement(wall.start.x));
            const wallTypeLabel = this.findWallTypeLabel(wallLength);
            const startDisplacementX = this.calcDisplacement(wall.start.x),
                endDisplacementX = this.calcDisplacement(wall.end.x + 1).sub(this.notchHeight),
                displacementY = this.calcDisplacement(wall.start.y);
            const spaceBetweenNotches = endDisplacementX.sub(startDisplacementX).sub(this.notchHeight);
            let vnWidth = this.materialThickness.mul(HALF).mul(this.numDigits(wallTypeLabel));
            vnWidth = min(vnWidth, spaceBetweenNotches);
            vectorNumber = new VectorNumber(wallTypeLabel, vnWidth, this.materialThickness, new OrderedPair(
                startDisplacementX.add(this.notchHeight).add(spaceBetweenNotches.mul(HALF)).sub(vnWidth.mul(HALF)), displacementY));
            sheetWallModel.floorNumbers.push(vectorNumber);
            firstNotch.addPoint(new OrderedPair(startDisplacementX, displacementY))
                .addPoint(new OrderedPair(startDisplacementX.add(this.notchHeight), displacementY))
                .addPoint(new OrderedPair(startDisplacementX.add(this.notchHeight), displacementY.add(this.materialThickness)))
                .addPoint(new OrderedPair(startDisplacementX, displacementY.add(this.materialThickness)));
            secondNotch.addPoint(new OrderedPair(endDisplacementX, displacementY))
                .addPoint(new OrderedPair(endDisplacementX.add(this.notchHeight), displacementY))
                .addPoint(new OrderedPair(endDisplacementX.add(this.notchHeight), displacementY.add(this.materialThickness)))
                .addPoint(new OrderedPair(endDisplacementX, displacementY.add(this.materialThickness)));
        } else {
            wallLength = this.calcDisplacement(wall.end.y + 1).sub(this.calcDisplacement(wall.start.y));
            const wallTypeLabel = this.findWallTypeLabel(wallLength);
            const startDisplacementY = this.calcDisplacement(wall.start.y),
                endDisplacementY = this.calcDisplacement(wall.end.y + 1).sub(this.notchHeight),
                displacementX = this.calcDisplacement(wall.start.x);
            const spaceBetweenNotches = endDisplacementY.sub(startDisplacementY).sub(this.notchHeight);
            let vnWidth = this.materialThickness.mul(HALF).mul(this.numDigits(wallTypeLabel));
            vnWidth = min(vnWidth, this.materialThickness);
            vectorNumber = new VectorNumber(wallTypeLabel, vnWidth, this.materialThickness,
                    new OrderedPair(displacementX.add(this.materialThickness.mul(HALF)).sub(vnWidth.mul(HALF)),
                startDisplacementY.add(this.notchHeight).add(spaceBetweenNotches.mul(HALF)).sub(this.materialThickness.mul(HALF))));
            sheetWallModel.floorNumbers.push(vectorNumber);
            firstNotch.addPoint(new OrderedPair(displacementX, startDisplacementY))
                .addPoint(new OrderedPair(displacementX.add(this.materialThickness), startDisplacementY))
                .addPoint(new OrderedPair(displacementX.add(this.materialThickness), startDisplacementY.add(this.notchHeight)))
                .addPoint(new OrderedPair(displacementX, startDisplacementY.add(this.notchHeight)));
            secondNotch.addPoint(new OrderedPair(displacementX, endDisplacementY))
                .addPoint(new OrderedPair(displacementX.add(this.materialThickness), endDisplacementY))
                .addPoint(new OrderedPair(displacementX.add(this.materialThickness), endDisplacementY.add(this.notchHeight)))
                .addPoint(new OrderedPair(displacementX, endDisplacementY.add(this.notchHeight)));
        }
        this.addNotchToEdgeMap(wall.start, firstNotch);
        this.addNotchToEdgeMap(wall.end, secondNotch);
        sheetWallModel.floorNotches.addPath(firstNotch).addPath(secondNotch);
        return wallLength;
    }
    /**
     * Each notch that touches the edge of the floor is kept in notchEdgeMap to keep track of which edge it's touching.
     * For notches that are on corner squares, they are only considered part of one edge; it is the edge that is further
     * clockwise.
     * @param wallEndCapCoords the grid-based coordinates of the notch
     * @param notch            the Path object for the notch
     */
    private addNotchToEdgeMap(wallEndCapCoords: OrderedPair<number>, notch: Path): void {
        const lastRow = this.model.height - 1, lastCol = this.model.width - 1;
        if (wallEndCapCoords.y === 0 && wallEndCapCoords.x !== lastCol) {
            this.notchEdgeMap.set(notch, new NotchPosInfo(Direction.NORTH, wallEndCapCoords.x === 0));
        } else if (wallEndCapCoords.x === lastCol && wallEndCapCoords.y !== lastRow) {
            this.notchEdgeMap.set(notch, new NotchPosInfo(Direction.EAST, wallEndCapCoords.y === 0));
        } else if (wallEndCapCoords.y === lastRow && wallEndCapCoords.x !== 0) {
            this.notchEdgeMap.set(notch, new NotchPosInfo(Direction.SOUTH, wallEndCapCoords.x === lastCol));
        } else if (wallEndCapCoords.x === 0 && wallEndCapCoords.y !== 0) {
            this.notchEdgeMap.set(notch, new NotchPosInfo(Direction.WEST, wallEndCapCoords.y === lastRow));
        }
    }

    /**
     * Iterates over the edge notches and creates paths connecting them to create the vaguely rectangular outline of the
     * floor
     * @param sheetWallModel model to add paths to
     */
    private createOutline(sheetWallModel: SheetWallModel): void {
        const paths: Path[] = [];
        const keyIter = this.notchEdgeMap.keys();
        let kObj;
        while (!(kObj = keyIter.next()).done) {
            paths.push(kObj.value);
        }
        paths.sort(this.edgeNotchComparator);
        for (let i = 0; i < paths.length; i++) {
            const notch = paths[i];
            const nextNotch = i < paths.length - 1 ? paths[i + 1] : paths[0];
            const notchInfo = this.notchEdgeMap.get(notch), nextNotchInfo = this.notchEdgeMap.get(nextNotch);
            if (typeof notchInfo === "undefined" || typeof nextNotchInfo === "undefined") {
                throw new Error("notch and nextNotch are definitely in the map because they were retrieved from notchEdgeMap.keys()");
            }
            if (notchInfo.direction === nextNotchInfo.direction || nextNotchInfo.isCorner) {
                const points = this.findNotchConnectionPoints(notchInfo, notch, nextNotch, false);
                const firstPoint = points.firstPoint, secondPoint = points.secondPoint;
                if (!firstPoint.equals(secondPoint)) {
                    sheetWallModel.floorOutline.addPath(new Path(firstPoint, secondPoint).setClosed(false));
                } else {
                    console.debug("skipping connecting floor outer path because it's length 0: " + firstPoint.toString());
                }
            } else {
                // notches are on different sides and neither is a corner (unusual case of both parts of a corner of the maze being open)
                const points = this.findNotchConnectionPoints(notchInfo, notch, nextNotch, true);
                sheetWallModel.floorOutline.addPath(new Path(points.firstPoint, points.cornerPoint).setClosed(false));
                sheetWallModel.floorOutline.addPath(new Path(points.cornerPoint, points.secondPoint).setClosed(false));
            }
        }
    }

    private findNotchConnectionPoints(notchInfo: NotchPosInfo, notch: Path, nextNotch: Path, includeCorner: boolean): NotchConnection {
        const nextNotchAdditive = includeCorner ? 1 : 0;
        let firstPoint: OrderedPair<Big>, floorCornerPoint: OrderedPair<Big>, secondPoint: OrderedPair<Big>;
        if (notchInfo.direction === Direction.NORTH) {
            firstPoint = notch.points[1];
            secondPoint = nextNotch.points[nextNotchAdditive];
            floorCornerPoint = new OrderedPair(secondPoint.x, firstPoint.y);
        } else if (notchInfo.direction === Direction.EAST) {
            firstPoint = notch.points[2];
            secondPoint = nextNotch.points[1 + nextNotchAdditive];
            floorCornerPoint = new OrderedPair(firstPoint.x, secondPoint.y);
        } else if (notchInfo.direction === Direction.SOUTH) {
            firstPoint = notch.points[3];
            secondPoint = nextNotch.points[2 + nextNotchAdditive];
            floorCornerPoint = new OrderedPair(secondPoint.x, firstPoint.y);
        } else if (notchInfo.direction === Direction.WEST) {
            firstPoint = notch.points[0];
            secondPoint = nextNotch.points[3 + nextNotchAdditive % 4];
            floorCornerPoint = new OrderedPair(firstPoint.x, secondPoint.y);
        } else {
            throw new Error("notch is not in edge map, but is on edge");
        }
        return new NotchConnection(firstPoint, floorCornerPoint, secondPoint);
    }

    private numDigits(number: number): number {
        const n = number < 0 ? -1 * number : number;
        let exp = 1;
        let powerOfTen = 10;
        while (true) {
            if (n < powerOfTen) {
                return exp;
            }
            powerOfTen *= 10;
            exp++;
        }
    }

    private findWallTypeLabel(wallLength: Big): number {
        let label = this.wallTypeLabelsByLength.get(wallLength.toString());
        if (typeof label !== "undefined") {
            return label;
        }
        label = this.wallTypeLabelsByLength.size;
        this.wallTypeLabelsByLength.set(wallLength.toString(), label);
        return label;
    }

    /**
     * sorts notches on the edge of the floor in a clockwise fashion: N,E,S,W so that the top left corner is the "lowest"
     * and a notch directly below that is the highest
     * e.g.
     * 1234
     * C  5
     * B  6
     * A987
     */
    private edgeNotchComparator = (p1: Path, p2: Path) => {
        const p1Info = this.notchEdgeMap.get(p1), p2Info = this.notchEdgeMap.get(p2);
        if (typeof p1Info === "undefined" || typeof p2Info === "undefined") {
            throw new Error("p1Info and p2Info are definitely in the map because they were retrieved from notchEdgeInfo.keys()");
        }
        const p1Dir = p1Info.direction, p2Dir = p2Info.direction;
        const dirCmp = SheetWallModelGenerator.directionRank[p1Dir.name] - SheetWallModelGenerator.directionRank[p2Dir.name];
        if (dirCmp !== 0) {
            return dirCmp;
        }
        // p1Dir === p2Dir
        if (p1Dir === Direction.NORTH) {
            return p1.points[0].x.cmp(p2.points[0].x);
        } else if (p1Dir === Direction.EAST) {
            return p1.points[0].y.cmp(p2.points[0].y);
        } else if (p1Dir === Direction.SOUTH) {
            return p2.points[0].x.cmp(p1.points[0].x);
        } else if (p1Dir === Direction.WEST) {
            return p2.points[0].y.cmp(p1.points[0].y);
        } else {
            throw new Error("notch is not in edge map, but is on edge");
        }
    }
}

function createDirectionRankMap(): object {
    const map = {};
    map[Direction.NORTH.name] = 0;
    map[Direction.EAST.name] = 1;
    map[Direction.SOUTH.name] = 2;
    map[Direction.WEST.name] = 3;
    return map;
}
