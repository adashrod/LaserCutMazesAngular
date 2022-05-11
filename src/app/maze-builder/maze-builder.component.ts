import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import type { SafeHtml } from "@angular/platform-browser";
import { DomSanitizer } from "@angular/platform-browser";
import Big from "big.js";
import { saveAs } from "file-saver";

import DepthFirstSearch from "app/algorithms/depth-first-search-algorithm";
import EmptyAlgorithm from "app/algorithms/empty-algorithm";
import KruskalsAlgorithm from "app/algorithms/kruskals-algorithm";
import type MazeGenerator from "app/algorithms/maze-generator";
import PrimsAlgorithm from "app/algorithms/prims-algorithm";
import OrderedPair from "app/common/ordered-pair";
import Unit from "app/common/unit";
import Direction from "app/direction";
import LinearWallModelGenerator from "app/factories/linear-wall-model-generator";
import RectangularWallModelGenerator from "app/factories/rectangular-wall-model-generator";
import SheetWallModelGenerator from "app/factories/sheet-wall-model-generator";
import SingleSheetModelGenerator from "app/factories/single-sheet-model-generator";
import MazePrinter from "app/maze-printer";
import { min } from "app/misc/big-util";
import CalibrationRectangle from "app/models/calibration-rectangle";
import Maze from "app/models/maze";
import MazeConfig from "app/models/maze-config";
import PrintMode from "app/print-mode";

@Component({
    selector: "app-maze-builder",
    templateUrl: "./maze-builder.component.html",
    styleUrls: ["./maze-builder.component.css"]
})
export class MazeBuilderComponent implements OnInit {
    private static AUTO_SVG_THRESHOLD_MS = 500;

    public readonly PrintMode = PrintMode;

    public readonly mazeUnits: Unit[] = Unit.values();
    public readonly rectangleUnits: Unit[] = [Unit.INCHES, Unit.CENTIMETERS];
    public readonly printModes: PrintMode[] = PrintMode.values();

    public mazeConfig: MazeConfig = new MazeConfig();
    public printMode: PrintMode = PrintMode.FLOOR_AND_WALL;
    public randomSeed: string = "";
    public lastSeedUsed: string;

    public maxWidth: number = 19.5;
    public maxHeight: number = 11;
    public maxPrinterUnits = Unit.INCHES;
    public ppu: number = 96;

    public includeCalibrationRectangle: boolean = false;
    public calibrationRectangleConfig: CalibrationRectangle = new CalibrationRectangle();
    public algorithms: MazeGenerator[] = [new DepthFirstSearch(), new PrimsAlgorithm(), new KruskalsAlgorithm(), new EmptyAlgorithm()];
    public currentAlgorithm = this.algorithms[0];

    public maze: Maze | null;
    public rawSvgSrc: string;
    public safeSvgSrc: SafeHtml | null;
    private _showSvgPreview: boolean = false;
    public autoGenerateSvg: boolean;
    public outOfBounds: boolean = false;

    private trackEvents: boolean = true;

    public get showSvgPreview(): boolean {
        return this._showSvgPreview;
    }

    public set showSvgPreview(show: boolean) {
        this._showSvgPreview = show;
        if (show) {
            this.sendEvent({
                hitType: "event",
                eventCategory: "Designer",
                eventAction: "showSvg"
            });
        }
    }

    public numericInputType: string = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent) ? "text" : "number";

    private consolidateConfigs(): string[][] {
        const configs: string[][] = [];
        const mc = this.mazeConfig;
        configs.push(["numMazeRows", mc.numRows.toString()]);
        configs.push(["numMazeCols", mc.numCols.toString()]);
        configs.push(["mazeUnits", mc.unit.pluralName]);
        configs.push(["wallHeight", mc.wallHeight.toString()]);
        configs.push(["materialThickness", mc.materialThickness.toString()]);
        configs.push(["hallWidth", mc.hallWidth.toString()]);
        configs.push(["separationSpace", mc.separationSpace.toString()]);
        configs.push(["algorithm", this.currentAlgorithm.name]);
        configs.push(["randomSeed", this.lastSeedUsed]);
        configs.push(["printerConfigUnits", this.maxPrinterUnits.pluralName]);
        configs.push(["printerConfigPixelsPerUnit", this.ppu.toString()]);
        configs.push(["maxPrinterWidth", this.maxWidth.toString()]);
        configs.push(["maxPrinterHeight", this.maxHeight.toString()]);
        configs.push(["calibrationRectangle", this.includeCalibrationRectangle ? "yes" : "no"]);
        if (this.includeCalibrationRectangle) {
            configs.push(["calibrationRectangleUnits", this.calibrationRectangleConfig.unit.pluralName]);
            configs.push(["calibrationRectangleWidth", this.calibrationRectangleConfig.width.toString()]);
            configs.push(["calibrationRectangleHeight", this.calibrationRectangleConfig.height.toString()]);
            configs.push(["calibrationRectangleHorizontal", this.calibrationRectangleConfig.leftAligned ? "left" : "right"]);
            configs.push(["calibrationRectangleVertical", this.calibrationRectangleConfig.topAligned ? "top" : "bottom"]);
        }
        return configs;
    }

    public constructor(private sanitizer: DomSanitizer) {}

    public ngOnInit(): void {
        this.mazeConfig.addChangeListener((oldVal, newVal) => {
            this.buildMaze();
        });
        this.trackEvents = false;
        this.autoGenerateSvg = this.benchmark() < MazeBuilderComponent.AUTO_SVG_THRESHOLD_MS;
        this.trackEvents = true;
    }

    public buildMaze(): void {
        this.safeSvgSrc = null;
        this.rawSvgSrc = "";
        if (typeof this.mazeConfig.numRows !== "number" || typeof this.mazeConfig.numCols !== "number" ||
                this.mazeConfig.numRows <= 0 || this.mazeConfig.numCols <= 0) {
            return;
        }
        const start = new Date().getTime();
        const maze = new Maze(this.mazeConfig.numCols, this.mazeConfig.numRows);
        this.currentAlgorithm.seed = this.randomSeed.toString().length > 0 ? this.randomSeed : new Date().getTime();
        this.lastSeedUsed = this.currentAlgorithm.seed.toString();
        maze.build(this.currentAlgorithm);
        console.log(`seed used: ${this.currentAlgorithm.seed}`);
        this.maze = maze;
        console.log(`maze build time: ${new Date().getTime() - start} ms`);
        if (this.trackEvents) {
            this.sendEvent({
                hitType: "event",
                eventCategory: "Designer",
                eventAction: "build",
                eventLabel: this.currentAlgorithm.name
            });
        }
        this.afterBuild();
    }

    private afterBuild(): void {
        if (this.autoGenerateSvg) {
            this.exportSvg();
        }
    }

    public onClickMazeCell(event: MouseEvent, row: number, column: number): void {
        const elem = <HTMLElement>event.target;
        const x = event.offsetX, y = event.offsetY;
        const edge = this.getEdge(x / elem.offsetWidth, y / elem.offsetHeight);
        if (edge !== null) {
            if (this.maze === null) {
                return;
            }
            const close = this.maze.grid[row][column].isOpen(edge);
            const otherCellDelta = this.getAdjacentCellDelta(edge);
            if (close) {
                this.maze.grid[row][column].closeWall(edge);
                if (this.maze.isInBounds(column + otherCellDelta.x, row + otherCellDelta.y)) {
                    this.maze.grid[row + otherCellDelta.y][column + otherCellDelta.x].closeWall(edge.opposite);
                }
            } else {
                this.maze.grid[row][column].openWall(edge);
                if (this.maze.isInBounds(column + otherCellDelta.x, row + otherCellDelta.y)) {
                    this.maze.grid[row + otherCellDelta.y][column + otherCellDelta.x].openWall(edge.opposite);
                }
            }
            this.afterBuild();
        }
    }

    private getAdjacentCellDelta(direction: Direction): OrderedPair<number> {
        if (direction === Direction.NORTH) {
            return new OrderedPair(0, -1);
        } else if (direction === Direction.EAST) {
            return new OrderedPair(1, 0);
        } else if (direction === Direction.SOUTH) {
            return new OrderedPair(0, 1);
        } else if (direction === Direction.WEST) {
            return new OrderedPair(-1, 0);
        }
        throw new Error("invalid direction");
    }

    public exportSvg(): void {
        if (this.maze === null) {
            return;
        }
        const multiplier = this.maxPrinterUnits.perInch.mul(this.ppu).div(this.mazeConfig.unit.perInch);
        const start = new Date().getTime();
        const linearWallModelGenerator = new LinearWallModelGenerator(this.maze);
        const linearWallModel = linearWallModelGenerator.generate();
        const rectangularWallModelGenerator = new RectangularWallModelGenerator(linearWallModel);
        const rectangularWallModel = rectangularWallModelGenerator.generate();
        let mazePrinter;
        if (this.printMode === PrintMode.FLOOR_AND_WALL) {
            const sheetWallModelGenerator = new SheetWallModelGenerator(rectangularWallModel);
            sheetWallModelGenerator.hallWidth = new Big(this.mazeConfig.hallWidth).mul(multiplier);
            sheetWallModelGenerator.materialThickness = new Big(this.mazeConfig.materialThickness).mul(multiplier);
            sheetWallModelGenerator.maxHeight = new Big(this.maxHeight).mul(this.ppu);
            sheetWallModelGenerator.maxWidth = new Big(this.maxWidth).mul(this.ppu);
            sheetWallModelGenerator.notchHeight = min(this.maxPrinterUnits.perInch.mul(this.ppu).div(Unit.MILLIMETERS.perInch).mul(4),
                new Big(this.mazeConfig.hallWidth).mul(multiplier).mul(".33"));
            sheetWallModelGenerator.separationSpace = new Big(this.mazeConfig.separationSpace).mul(multiplier);
            sheetWallModelGenerator.wallHeight = new Big(this.mazeConfig.wallHeight).mul(multiplier);
            const sheetWallModel = sheetWallModelGenerator.generate();
            this.outOfBounds = sheetWallModel.outOfBounds;
            mazePrinter = new MazePrinter(sheetWallModel, new Big(this.maxWidth).mul(this.ppu),
                new Big(this.maxHeight).mul(this.ppu), this.maxPrinterUnits, this.ppu);
        } else if (this.printMode === PrintMode.SINGLE_SHEET) {
            const singleSheetModelGenerator = new SingleSheetModelGenerator(rectangularWallModel);
            singleSheetModelGenerator.hallWidth = new Big(this.mazeConfig.hallWidth).mul(multiplier);
            singleSheetModelGenerator.wallWidth = new Big(this.mazeConfig.materialThickness).mul(multiplier);
            singleSheetModelGenerator.maxHeight = new Big(this.maxHeight).mul(this.ppu);
            singleSheetModelGenerator.maxWidth = new Big(this.maxWidth).mul(this.ppu);
            singleSheetModelGenerator.separationSpace = new Big(this.mazeConfig.separationSpace).mul(multiplier);
            const singleSheetModel = singleSheetModelGenerator.generate();
            this.outOfBounds = singleSheetModel.outOfBounds;
            mazePrinter = new MazePrinter(singleSheetModel, new Big(this.maxWidth).mul(this.ppu),
                new Big(this.maxHeight).mul(this.ppu), this.maxPrinterUnits, this.ppu);
        } else {
            console.error("impossible PrintMode enum: ", this.printMode);
            return;
        }

        if (this.includeCalibrationRectangle) {
            this.rawSvgSrc = mazePrinter.printSvg(this.consolidateConfigs(), this.calibrationRectangleConfig);
        } else {
            this.rawSvgSrc = mazePrinter.printSvg(this.consolidateConfigs());
        }
        this.safeSvgSrc = this.sanitizer.bypassSecurityTrustHtml(this.rawSvgSrc);
        console.info(`svg export time: ${new Date().getTime() - start} ms`);
        if (!this.autoGenerateSvg && this.trackEvents) {
            this.sendEvent({
                hitType: "event",
                eventCategory: "Designer",
                eventAction: "export",
                eventLabel: `${this.currentAlgorithm.name}-${this.printMode.name}`
            });
        }
    }

    public downloadSvg(): void {
        const blob = new Blob([this.rawSvgSrc], {type: "image/svg+xml;charset=utf-8"});
        saveAs(blob, "maze.svg");
        this.sendEvent({
            hitType: "event",
            eventCategory: "Designer",
            eventAction: "download",
            eventLabel: `${this.currentAlgorithm.name}-${this.printMode.name}`
        });
    }

    private benchmark(): number {
        const start = new Date().getTime();
        this.mazeConfig.numCols = 8;
        this.mazeConfig.numRows = 8;
        // no need to call buildMaze() because it gets called automatically by the changeListener
        this.exportSvg();
        const end = new Date().getTime();
        this.mazeConfig.numCols = 0;
        this.mazeConfig.numRows = 0;
        this.maze = null;
        this.lastSeedUsed = "";
        return end - start;
    }

    private getEdge(x: number, y: number): Direction | null {
        const threshold = .3;
        if (x < threshold) {
            if (y < threshold) {
                return Direction.NORTH;
            } else if (y > 1 - threshold) {
                return Direction.SOUTH;
            }
            return Direction.WEST;
        } else if (x > 1 - threshold) {
            if (y < threshold) {
                return Direction.NORTH;
            } else if (y > 1 - threshold) {
                return Direction.SOUTH;
            }
            return Direction.EAST;
        }
        if (y < threshold) {
            return Direction.NORTH;
        }
        if (y > 1 - threshold) {
            return Direction.SOUTH;
        }
        return null;
    }

    private sendEvent(payload: { hitType: string; eventCategory: string; eventAction: string; eventLabel?: string}): void {
        if (typeof (window as any).ga === "function") {
            (window as any).ga("send", payload);
        }
    }
}
