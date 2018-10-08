import Big from "big.js";

import OrderedPair from "app/common/ordered-pair";
import { ZERO } from "app/misc/big-util";
import Path from "app/models/path";
import RectangularWallModel from "app/models/rectangular-wall-model";
import SingleSheetModel from "app/models/single-sheet-model";

export default class SingleSheetModelGenerator {

    wallWidth: Big;
    hallWidth: Big;
    separationSpace: Big;
    maxWidth: Big;
    maxHeight: Big;

    private model: RectangularWallModel;

    constructor(model: RectangularWallModel) {
        this.model = model;
    }

    public generate(): SingleSheetModel {
        const singleSheetModel = new SingleSheetModel();

        for (let r = 0; r < this.model.isWall.length; r++) {
            const row = this.model.isWall[r];
            let startC: number | null = null;
            for (let c = 0; c < row.length; c++) {
                const cellIsWall = row[c];
                if (startC === null) {
                    if (!cellIsWall) {
                        startC = c;
                    }
                } else {
                    let exclusiveRangeEnd;
                    if (cellIsWall) {
                        exclusiveRangeEnd = c;
                    } else if (c + 1 === row.length) {
                        exclusiveRangeEnd = row.length;
                    } else {
                        continue;
                    }
                    const rangeEvensAndOdds = this.countEvensAndOdds(startC, exclusiveRangeEnd),
                        startXEvensAndOdds = this.countEvensAndOdds(0, startC),
                        startYEvensAndOdds = this.countEvensAndOdds(0, r);
                    const wallSpan = rangeEvensAndOdds.evens, hallwaySpan = rangeEvensAndOdds.odds,
                        wallSpanToStartX = startXEvensAndOdds.evens, hallwaySpanToStartX = startXEvensAndOdds.odds,
                        wallSpanToStartY = startYEvensAndOdds.evens, hallwaySpanToStartY = startYEvensAndOdds.odds;
                    const startX = this.wallWidth.mul(wallSpanToStartX).plus(this.hallWidth.mul(hallwaySpanToStartX)),
                        startY = this.wallWidth.mul(wallSpanToStartY).plus(this.hallWidth.mul(hallwaySpanToStartY));
                    const pixelWidth = this.hallWidth.mul(hallwaySpan).add(this.wallWidth.mul(wallSpan));
                    const endX = startX.add(pixelWidth),
                        endY = startY.add(r % 2 === 0 ? this.wallWidth : this.hallWidth);
                    const hole = new Path()
                        .addPoint(new OrderedPair<Big>(startX, startY))
                        .addPoint(new OrderedPair<Big>(endX, startY))
                        .addPoint(new OrderedPair<Big>(endX, endY))
                        .addPoint(new OrderedPair<Big>(startX, endY));
                    singleSheetModel.addHole(hole);
                    startC = null;
                }
            }
        }
        const floorWidth = this.wallWidth.mul((this.model.width + 1) / 2).add(this.hallWidth.mul((this.model.width - 1) / 2)),
            floorHeight = this.wallWidth.mul((this.model.height + 1) / 2).add(this.hallWidth.mul((this.model.height - 1) / 2));
        const outlinePath = new Path()
            .addPoint(new OrderedPair<Big>(ZERO, ZERO))
            .addPoint(new OrderedPair<Big>(floorWidth, ZERO))
            .addPoint(new OrderedPair<Big>(floorWidth, floorHeight))
            .addPoint(new OrderedPair<Big>(ZERO, floorHeight));
        const extraOutline = Path.copy(outlinePath);
        extraOutline.translate(new OrderedPair<Big>(outlinePath.width.add(this.separationSpace), ZERO));
        singleSheetModel.floorOutline.addPath(outlinePath).addPath(extraOutline);

        if (singleSheetModel.maxHorizontalDisplacement.gt(this.maxWidth) || singleSheetModel.maxVerticalDisplacement.gt(this.maxHeight)) {
            singleSheetModel.outOfBounds = true;
        }
        return singleSheetModel;
    }

    /**
     * Counts the number of even and odds numbers in the specified range
     * @param start start of range, inclusive
     * @param end   end of range, exclusive
     * @return an object with two properties: evens and odds
     */
    private countEvensAndOdds(start: number, endExclusive: number): { evens: number, odds: number } {
        const result: { evens: number, odds: number } = { evens: 0, odds: 0 };
        if (endExclusive > start) {
            const count = endExclusive - start;
            result.odds = Math.floor((count + start % 2) / 2);
            result.evens = count - result.odds;
        }
        return result;
    }
}
