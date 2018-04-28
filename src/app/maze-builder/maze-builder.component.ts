import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import Big from "big.js";
import { saveAs } from "file-saver";

import DepthFirstSearch from "app/algorithms/depth-first-search-algorithm";
import KruskalsAlgorithm from "app/algorithms/kruskals-algorithm";
import MazeGenerator from "app/algorithms/maze-generator";
import PrimsAlgorithm from "app/algorithms/prims-algorithm";
import Unit from "app/common/unit";
import LinearWallModelGenerator from "app/factories/linear-wall-model-generator";
import RectangularWallModelGenerator from "app/factories/rectangular-wall-model-generator";
import SheetWallModelGenerator from "app/factories/sheet-wall-model-generator";
import { min } from "app/misc/big-util";
import CalibrationRectangle from "app/models/calibration-rectangle";
import Maze from "app/models/maze";
import MazeConfig from "app/models/maze-config";
import MazePrinter from "app/maze-printer";

@Component({
    selector: "app-maze-builder",
    templateUrl: "./maze-builder.component.html",
    styleUrls: ["./maze-builder.component.css"]
})
export class MazeBuilderComponent implements OnInit {
    readonly mazeUnits: Unit[] = [Unit.INCHES, Unit.CENTIMETERS, Unit.MILLIMETERS];
    readonly rectangleUnits: Unit[] = [Unit.INCHES, Unit.CENTIMETERS];

    mazeConfig: MazeConfig = new MazeConfig();
    randomSeed: string = "";
    lastSeedUsed: string;

    maxWidth: number = 19.5;
    maxHeight: number = 11;
    maxPrinterUnits = Unit.INCHES;

    includeCalibrationRectangle: boolean = false;
    calibrationRectangleConfig: CalibrationRectangle = new CalibrationRectangle();
    algorithms: MazeGenerator[] = [new PrimsAlgorithm(), new KruskalsAlgorithm(), new DepthFirstSearch()];
    currentAlgorithm = 0;

    maze: Maze;
    svgSrc: string | null;
    svgDataUrl: SafeUrl | null;
    showSvgPreview: boolean = false;

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit(): void {
        this.mazeConfig.addChangeListener((oldVal, newVal) => {
            this.buildMaze();
        });
    }

    buildMaze() {
        if (typeof this.mazeConfig.numRows !== "number" || typeof this.mazeConfig.numCols !== "number") {
            return;
        }
        this.svgSrc = null;
        this.svgDataUrl = null;
        const start = new Date().getTime();
        const maze = new Maze(this.mazeConfig.numCols, this.mazeConfig.numRows);
        const algo = this.algorithms[this.currentAlgorithm];
        algo.seed = this.randomSeed.toString().length > 0 ? this.randomSeed : new Date().getTime();
        this.lastSeedUsed = algo.seed.toString();
        maze.build(algo);
        console.log(`seed used: ${algo.seed}`);
        this.maze = maze;
        console.log(`maze build time: ${new Date().getTime() - start} ms`);
    }

    exportSvg() {
        const start = new Date().getTime();
        const linearWallModelGenerator = new LinearWallModelGenerator(this.maze);
        const linearWallModel = linearWallModelGenerator.generate();
        const rectangularWallModelGenerator = new RectangularWallModelGenerator(linearWallModel);
        const rectangularWallModel = rectangularWallModelGenerator.generate();
        const sheetWallModelGenerator = new SheetWallModelGenerator(rectangularWallModel);
        sheetWallModelGenerator.hallWidth = new Big(this.mazeConfig.hallWidth).mul(this.mazeConfig.unit.pixelsPer);
        sheetWallModelGenerator.materialThickness = new Big(this.mazeConfig.materialThickness).mul(this.mazeConfig.unit.pixelsPer);
        sheetWallModelGenerator.maxHeight = new Big(this.maxHeight).mul(this.maxPrinterUnits.pixelsPer);
        sheetWallModelGenerator.maxWidth = new Big(this.maxWidth).mul(this.maxPrinterUnits.pixelsPer);
        sheetWallModelGenerator.notchHeight = min(Unit.MILLIMETERS.pixelsPer.mul("4"),
            new Big(this.mazeConfig.hallWidth).mul(this.mazeConfig.unit.pixelsPer).mul(".33"));
        sheetWallModelGenerator.separationSpace = new Big(this.mazeConfig.separationSpace).mul(this.mazeConfig.unit.pixelsPer);
        sheetWallModelGenerator.wallHeight = new Big(this.mazeConfig.wallHeight).mul(this.mazeConfig.unit.pixelsPer);
        const sheetWallModel = sheetWallModelGenerator.generate();
        const mazePrinter = new MazePrinter(sheetWallModel, new Big(this.maxWidth).mul(this.maxPrinterUnits.pixelsPer),
            new Big(this.maxHeight).mul(this.maxPrinterUnits.pixelsPer));
        if (this.includeCalibrationRectangle) {
            this.svgSrc = mazePrinter.printSvg(this.calibrationRectangleConfig);
        } else {
            this.svgSrc = mazePrinter.printSvg();
        }
        this.svgDataUrl = this.sanitizer.bypassSecurityTrustUrl(`data:image/svg+xml;utf-8,${this.svgSrc}`);
        console.info(`svg export time: ${new Date().getTime() - start} ms`);
    }

    toggleSvgPreview() {
        this.showSvgPreview = !this.showSvgPreview;
    }

    downloadSvg() {
        const file = new File([this.svgSrc || ""], "maze.svg", {type: "image/svg+xml;charset=utf-8"});
        saveAs(file);
    }
}
