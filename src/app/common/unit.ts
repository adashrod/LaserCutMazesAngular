import Big from "big.js";

export default class Unit {
    static INCHES: Unit = new Unit("inches", new Big(96));
    static CENTIMETERS: Unit = new Unit("centimeters", new Big(35.433071));
    static MILLIMETERS: Unit = new Unit("millimeters", new Big(3.5433071));

    readonly name: string;
    readonly pixelsPer: Big;

    private constructor(name: string, pixelsPer: Big) {
        this.name = name;
        this.pixelsPer = pixelsPer;
    }
}
