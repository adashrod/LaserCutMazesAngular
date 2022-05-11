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
    public leftAligned: boolean = true;
    public topAligned: boolean = true;

    /**
     * the integral number of units wide the rectangle is
     */
    public get width(): number {
        return this._width;
    }

    public set width(w: number) {
        let val: number;
        if (typeof w === "string") {
            val = parseInt(w, 10);
        } else {
            val = w;
        }
        this._width = Math.max(1, Math.floor(val));
    }

    /**
     * the integral number of units high the rectangle is
     */
    public get height(): number {
        return this._height;
    }

    public set height(h: number) {
        let val: number;
        if (typeof h === "string") {
            val = parseInt(h, 10);
        } else {
            val = h;
        }
        this._height = Math.max(1, Math.floor(val));
    }

    public get unit(): Unit {
        return this._unit;
    }

    public set unit(u: Unit) {
        if (u === Unit.INCHES || u === Unit.CENTIMETERS) {
            this._unit = u;
        } else {
            this._unit = Unit.INCHES;
        }
    }
}
