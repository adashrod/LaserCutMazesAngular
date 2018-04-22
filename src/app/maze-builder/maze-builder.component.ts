import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import Big from "big.js";

import KruskalsAlgorithm from "app/algorithms/kruskals-algorithm";
import MazeGenerator from "app/algorithms/maze-generator";
import PrimsAlgorithm from "app/algorithms/prims-algorithm";
import Unit from "app/common/unit";
import LinearWallModelGenerator from "app/factories/linear-wall-model-generator";
import RectangularWallModelGenerator from "app/factories/rectangular-wall-model-generator";
import SheetWallModelGenerator from "app/factories/sheet-wall-model-generator";
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

    maxWidth: number = 19.5;
    maxHeight: number = 11;
    mazeConfig: MazeConfig = new MazeConfig();
    includeCalibrationRectangle: boolean = false;
    calibrationRectangleConfig: CalibrationRectangle = new CalibrationRectangle();
    randomSeed: string = "";
    algorithms: MazeGenerator[] = [new PrimsAlgorithm(), new KruskalsAlgorithm];
    currentAlgorithm = 0;

    testMaze: Maze;
    testSvgSrc: string;
    svgDataUrl: SafeUrl;

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit() {}

    buildMaze() {
        const start = new Date().getTime();
        console.log(`building a maze with mazeConfig: ${JSON.stringify(this.mazeConfig)}, maxWidth: ${this.maxWidth}, maxHeight: ` +
            `${this.maxHeight}, ${this.includeCalibrationRectangle ? "include" : "no"} calibration rectangle ` +
            `${this.includeCalibrationRectangle ? JSON.stringify(this.calibrationRectangleConfig) : ""}`);
        const maze = new Maze(this.mazeConfig.numCols, this.mazeConfig.numRows);
        const a = this.algorithms[this.currentAlgorithm];
        a.seed = this.randomSeed.toString().length > 0 ? this.randomSeed : new Date().getTime();
        maze.build(a);
        console.log(`seed used: ${a.seed}`);
        this.testMaze = maze;

        const linearWallModelGenerator = new LinearWallModelGenerator(maze);
        const linearWallModel = linearWallModelGenerator.generate();
        const rectangularWallModelGenerator = new RectangularWallModelGenerator(linearWallModel);
        const rectangularWallModel = rectangularWallModelGenerator.generate();
        const sheetWallModelGenerator = new SheetWallModelGenerator(rectangularWallModel);
        sheetWallModelGenerator.hallWidth = new Big(this.mazeConfig.hallWidth).mul(this.mazeConfig.unit.pixelsPer);
        sheetWallModelGenerator.materialThickness = new Big(this.mazeConfig.materialThickness).mul(this.mazeConfig.unit.pixelsPer);
        sheetWallModelGenerator.maxHeight = new Big(this.maxHeight).mul(this.mazeConfig.unit.pixelsPer);
        sheetWallModelGenerator.maxWidth = new Big(this.maxWidth).mul(this.mazeConfig.unit.pixelsPer);
        sheetWallModelGenerator.notchHeight = new Big(this.mazeConfig.notchHeight).mul(this.mazeConfig.unit.pixelsPer);
        sheetWallModelGenerator.separationSpace = new Big(this.mazeConfig.separationSpace).mul(this.mazeConfig.unit.pixelsPer);
        sheetWallModelGenerator.wallHeight = new Big(this.mazeConfig.wallHeight).mul(this.mazeConfig.unit.pixelsPer);
        const sheetWallModel = sheetWallModelGenerator.generate();
        const mazePrinter = new MazePrinter(sheetWallModel, new Big(this.maxWidth), new Big(this.maxHeight));
        let svgSrc;
        if (this.includeCalibrationRectangle) {
            svgSrc = mazePrinter.printSvg(this.calibrationRectangleConfig);
        } else {
            svgSrc = mazePrinter.printSvg();
        }
        this.testSvgSrc = svgSrc;
        this.svgDataUrl = this.sanitizer.bypassSecurityTrustUrl(`data:image/svg+xml;utf-8,${svgSrc}`);
        console.log(`total time: ${new Date().getTime() - start} ms`);
    }
}
