import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import Big from "big.js";
import { saveAs } from "file-saver";

import DepthFirstSearch from "app/algorithms/depth-first-search-algorithm";
import EmptyAlgorithm from "app/algorithms/empty-algorithm";
import KruskalsAlgorithm from "app/algorithms/kruskals-algorithm";
import MazeGenerator from "app/algorithms/maze-generator";
import PrimsAlgorithm from "app/algorithms/prims-algorithm";
import OrderedPair from "app/common/ordered-pair";
import Unit from "app/common/unit";
import LinearWallModelGenerator from "app/factories/linear-wall-model-generator";
import RectangularWallModelGenerator from "app/factories/rectangular-wall-model-generator";
import SheetWallModelGenerator from "app/factories/sheet-wall-model-generator";
import { min } from "app/misc/big-util";
import CalibrationRectangle from "app/models/calibration-rectangle";
import Maze from "app/models/maze";
import MazeConfig from "app/models/maze-config";
import Direction from "app/direction";
import MazePrinter from "app/maze-printer";

@Component({
    selector: "app-maze-builder",
    templateUrl: "./maze-builder.component.html",
    styleUrls: ["./maze-builder.component.css"]
})
export class MazeBuilderComponent implements OnInit {
    static AUTO_SVG_THRESHOLD_MS = 500;
    readonly mazeUnits: Unit[] = [Unit.INCHES, Unit.CENTIMETERS, Unit.MILLIMETERS];
    readonly rectangleUnits: Unit[] = [Unit.INCHES, Unit.CENTIMETERS];

    mazeConfig: MazeConfig = new MazeConfig();
    randomSeed: string = "";
    lastSeedUsed: string;

    maxWidth: number = 19.5;
    maxHeight: number = 11;
    maxPrinterUnits = Unit.INCHES;
    ppu: number = 96;

    includeCalibrationRectangle: boolean = false;
    calibrationRectangleConfig: CalibrationRectangle = new CalibrationRectangle();
    algorithms: MazeGenerator[] = [new DepthFirstSearch(), new PrimsAlgorithm(), new KruskalsAlgorithm(), new EmptyAlgorithm()];
    currentAlgorithm = this.algorithms[0];

    maze: Maze | null;
    rawSvgSrc: string | null;
    safeSvgSrc: SafeHtml | null;
    private _showSvgPreview: boolean = false;
    autoGenerateSvg: boolean;
    outOfBounds: boolean = false;

    trackEvents: boolean = true;

    get showSvgPreview(): boolean {
        return this._showSvgPreview;
    }

    set showSvgPreview(show: boolean) {
        this._showSvgPreview = show;
        if (show) {
            (<any>window).ga("send", {
                hitType: "event",
                eventCategory: "Builder",
                eventAction: "showSvg"
            });
        }
    }

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

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit(): void {
        this.mazeConfig.addChangeListener((oldVal, newVal) => {
            this.buildMaze();
        });
        this.trackEvents = false;
        this.autoGenerateSvg = this.benchmark() < MazeBuilderComponent.AUTO_SVG_THRESHOLD_MS;
        this.trackEvents = true;
    }

    buildMaze() {
        this.safeSvgSrc = null;
        this.rawSvgSrc = null;
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
            (<any>window).ga("send", {
                hitType: "event",
                eventCategory: "Builder",
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

    onClickMazeCell(event: MouseEvent, row: number, column: number): void {
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

    exportSvg() {
        if (this.maze === null) {
            return;
        }
        const multiplier = this.maxPrinterUnits.perInch.mul(this.ppu).div(this.mazeConfig.unit.perInch);
        const start = new Date().getTime();
        const linearWallModelGenerator = new LinearWallModelGenerator(this.maze);
        const linearWallModel = linearWallModelGenerator.generate();
        const rectangularWallModelGenerator = new RectangularWallModelGenerator(linearWallModel);
        const rectangularWallModel = rectangularWallModelGenerator.generate();
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
        const mazePrinter = new MazePrinter(sheetWallModel, new Big(this.maxWidth).mul(this.ppu),
            new Big(this.maxHeight).mul(this.ppu), this.maxPrinterUnits, this.ppu);
        if (this.includeCalibrationRectangle) {
            this.rawSvgSrc = mazePrinter.printSvg(this.consolidateConfigs(), this.calibrationRectangleConfig);
        } else {
            this.rawSvgSrc = mazePrinter.printSvg(this.consolidateConfigs());
        }
        this.safeSvgSrc = this.sanitizer.bypassSecurityTrustHtml(this.rawSvgSrc);
        this.outOfBounds = sheetWallModel.outOfBounds;
        console.info(`svg export time: ${new Date().getTime() - start} ms`);
        if (!this.autoGenerateSvg && this.trackEvents) {
            (<any>window).ga("send", {
                hitType: "event",
                eventCategory: "Builder",
                eventAction: "export",
                eventLabel: this.currentAlgorithm.name
            });
        }
    }

    downloadSvg() {
        const file = new File([this.rawSvgSrc || ""], "maze.svg", {type: "image/svg+xml;charset=utf-8"});
        saveAs(file);
        (<any>window).ga("send", {
            hitType: "event",
            eventCategory: "Builder",
            eventAction: "download",
            eventLabel: this.currentAlgorithm.name
        });
    }

    private benchmark(): number {
        const start = new Date().getTime();
        this.mazeConfig.numCols = 8;
        this.mazeConfig.numRows = 8;
        this.buildMaze();
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
}
