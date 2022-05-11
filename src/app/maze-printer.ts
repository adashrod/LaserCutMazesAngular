import type Big from "big.js";

import OrderedPair from "app/common/ordered-pair";
import type Unit from "app/common/unit";
import { ZERO } from "app/misc/big-util";
import SVG_HEADER from "app/misc/svg-header";
import type CalibrationRectangle from "app/models/calibration-rectangle";
import SheetWallModel from "app/models/sheet-wall-model";
import type SingleSheetModel from "app/models/single-sheet-model";
import type VectorNumber from "app/models/vector-number";
import Path from "app/svg/path";
import SvgElementGenerator from "app/svg/svg-element-generator";

export default class MazePrinter {
    public singleSheetModel: SingleSheetModel | null = null;
    private sheetWallModel: SheetWallModel | null = null;
    private maxWidth: Big;
    private maxHeight: Big;
    private printerUnits: Unit;
    private ppu: number;
    public precision: number = 5;

    public constructor(model: SheetWallModel | SingleSheetModel, maxWidth: Big, maxHeight: Big, printerUnits: Unit, ppu: number) {
        if (model instanceof SheetWallModel) {
            this.sheetWallModel = model;
        } else {
            this.singleSheetModel = model;
        }
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.printerUnits = printerUnits;
        this.ppu = ppu;
    }

    /**
     * Prints an SVG with shapes representing cut-out sections that will be the walls and floor of a maze
     * @param configs              array of 2-tuple arrays, each containing a name and value
     * @param calibrationRectangle optional configuration for a calibration rectangle to print in the SVG
     */
    public printSvg(configs: string[][], calibrationRectangle?: CalibrationRectangle): string {
        let result = SVG_HEADER;
        const svgElementGenerator = new SvgElementGenerator();

        let outOfBounds;
        if (this.sheetWallModel !== null) {
            outOfBounds = this.sheetWallModel.outOfBounds;
            result = result.replace("{width}", this.sheetWallModel.maxHorizontalDisplacement.plus(5).toString())
                .replace("{height}", this.sheetWallModel.maxVerticalDisplacement.plus(5).toString());
            result += this.createConfigComment(configs);
            result += "<g id=\"floor-notches\">";
            for (const notch of this.sheetWallModel.floorNotches.paths) {
                const svgPath = svgElementGenerator.modelPathToSvgPath(notch);
                result += svgElementGenerator.pathToSvgText(svgPath, this.precision);
            }
            result += "</g>\n";

            result += "<g id=\"floor-numbers\">";
            for (const floorNumber of this.sheetWallModel.floorNumbers) {
                result += svgElementGenerator.vectorNumberToSvgText(floorNumber, this.precision);
            }
            result += "</g>\n";

            result += "<g id=\"wall-numbers\">";
            const wallLabelValues: VectorNumber[] = [];
            const valIter = this.sheetWallModel.wallLabels.values();
            let vObj;
            while (!(vObj = valIter.next()).done) {
                wallLabelValues.push(vObj.value);
            }
            for (const wallNumber of wallLabelValues) {
                result += svgElementGenerator.vectorNumberToSvgText(wallNumber, this.precision);
            }
            result += "</g>\n";

            result += "<g id=\"walls\">";
            for (const shape of this.sheetWallModel.walls) {
                for (const wall of shape.paths) {
                    const svgPath = svgElementGenerator.modelPathToSvgPath(wall);
                    result += svgElementGenerator.pathToSvgText(svgPath, this.precision);
                }
            }
            result += "</g>\n";

            result += "<g id=\"floor-outline\">";
            for (const outlinePath of this.sheetWallModel.floorOutline.paths) {
                const svgPath = svgElementGenerator.modelPathToSvgPath(outlinePath);
                svgPath.style = svgPath.style.replace("#000000", "#ff0000");
                result += svgElementGenerator.pathToSvgText(svgPath, this.precision);
            }
            result += "</g>\n";
        } else if (this.singleSheetModel !== null) {
            outOfBounds = this.singleSheetModel.outOfBounds;
            result = result.replace("{width}", this.singleSheetModel.maxHorizontalDisplacement.plus(5).toString())
                .replace("{height}", this.singleSheetModel.maxVerticalDisplacement.plus(5).toString());
            result += this.createConfigComment(configs);
            result += "<g id=\"floor-outline\">";
            for (const path of this.singleSheetModel.floorOutline.paths) {
                const svgPath = svgElementGenerator.modelPathToSvgPath(path);
                svgPath.style = svgPath.style.replace("#000000", "#ff0000");
                result += svgElementGenerator.pathToSvgText(svgPath, this.precision);
            }
            result += "</g>\n";

            result += "<g id=\"holes\">";
            for (const hole of this.singleSheetModel.holes.paths) {
                const svgPath = svgElementGenerator.modelPathToSvgPath(hole);
                result += svgElementGenerator.pathToSvgText(svgPath, this.precision);
            }
            result += "</g>\n";
        } else {
            throw new Error("illegal state: can't call MazePrinter#print() without a model");
        }
        if (calibrationRectangle != null) {
            result += "<g id=\"calibration-rectangle\">";
            for (const rectSide of this.buildCalibrationRectangle(calibrationRectangle)) {
                rectSide.style = rectSide.style.replace("000000", "00ff00");
                result += svgElementGenerator.pathToSvgText(rectSide, this.precision);
            }
            result += "</g>\n";
        }

        if (outOfBounds) {
            result += "<g id=\"bounding-box\">";
            for (const rectSide of this.buildBoundingBoxRectangle()) {
                rectSide.style = rectSide.style.replace("000000", "ff00ff");
                result += svgElementGenerator.pathToSvgText(rectSide, this.precision);
            }
            result += "</g>\n";
        }

        result += "</svg>\n";
        return result;
    }

    private createConfigComment(configs: string[][]): string {
        // eslint-disable-next-line sequence/strict-camel-case
        let comment = `<!--\n\tGenerated by Laser-Cut Mazes http://adashrod.github.io/LaserCutMazes on ${new Date().toISOString()}\n`;
        for (const config of configs) {
            comment += `\t${config[0]}: ${config[1]}\n`;
        }
        comment += "-->\n";
        return comment;
    }

    private buildCalibrationRectangle(calibrationRectangle: CalibrationRectangle): [Path, Path, Path, Path] {
        const multiplier = this.printerUnits.perInch.mul(this.ppu).div(calibrationRectangle.unit.perInch),
            width = multiplier.mul(calibrationRectangle.width),
            height = multiplier.mul(calibrationRectangle.height);
        const topLeft = new OrderedPair(ZERO, ZERO);
        if (!calibrationRectangle.leftAligned) {
            topLeft.x = this.maxWidth.sub(width);
        }
        if (!calibrationRectangle.topAligned) {
            topLeft.y = this.maxHeight.sub(height);
        }
        const topRight = new OrderedPair(topLeft.x.add(width), topLeft.y),
            bottomRight = new OrderedPair(topRight.x, topLeft.y.add(height)),
            bottomLeft = new OrderedPair(topLeft.x, bottomRight.y);
        const top = new Path(topLeft, topRight),
            right = new Path(topRight, bottomRight),
            bottom = new Path(bottomRight, bottomLeft),
            left = new Path(bottomLeft, topLeft);
        return [top, right, bottom, left];
    }

    private buildBoundingBoxRectangle(): [Path, Path, Path, Path] {
        const top: Path = new Path(new OrderedPair<Big>(ZERO, ZERO), new OrderedPair<Big>(this.maxWidth, ZERO)),
            right: Path = new Path(new OrderedPair<Big>(this.maxWidth, ZERO), new OrderedPair<Big>(this.maxWidth, this.maxHeight)),
            bottom: Path = new Path(new OrderedPair<Big>(this.maxWidth, this.maxHeight), new OrderedPair<Big>(ZERO, this.maxHeight)),
            left: Path = new Path(new OrderedPair<Big>(ZERO, this.maxHeight), new OrderedPair<Big>(ZERO, ZERO));
        return [top, right, bottom, left];
    }
}
