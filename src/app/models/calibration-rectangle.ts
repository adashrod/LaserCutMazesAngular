import Unit from "app/common/unit";

/**
 * A model for a single rectangle with integral width and height values in inches or cm. This can be printed on an SVG
 * to help calibrate the scale of the SVG on printing software.
 * @author adashrod@gmail.com
 */
export default class CalibrationRectangle {
    private _width: number = 6;
    private _height: number = 6;
    private _unit: Unit = Unit.INCHES;
    leftAligned: boolean = true;
    topAligned: boolean = true;

    /**
     * the integral number of units wide the rectangle is
     */
    get width(): number {
        return this._width;
    }

    set width(w: number) {
        this._width = Math.max(1, Math.floor(w));
    }

    /**
     * the integral number of units high the rectangle is
     */
    get height(): number {
        return this._height;
    }

    set height(h: number) {
        this._height = Math.max(1, Math.floor(h));
    }

    get unit(): Unit {
        return this._unit;
    }

    set unit(u: Unit) {
        if (u === Unit.INCHES || u === Unit.CENTIMETERS) {
            this._unit = u;
        } else {
            this._unit = Unit.INCHES;
        }
    }
}
