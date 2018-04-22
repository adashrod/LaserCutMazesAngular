import Big from "big.js";

/**
 * an SVG <rect/> element
 * @author adashrod@gmail.com
 */
export default class Rect {
    style = "stroke:#000000;fill:none;";
    id: string;
    width: Big;
    height: Big;
    x: Big;
    y: Big;

    constructor(id: string, width: Big, height: Big, x: Big, y: Big) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }

    scale(factor: Big): void {
        this.width = this.width.mul(factor);
        this.height = this.height.mul(factor);
        this.x = this.x.mul(factor);
        this.y = this.y.mul(factor);
    }
}
