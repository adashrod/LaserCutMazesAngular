import Big from "big.js";

export default class Unit {
    static INCHES: Unit = new Unit("inch", "es", new Big(1));
    static CENTIMETERS: Unit = new Unit("centimeter", "s", new Big("2.54"));
    static MILLIMETERS: Unit = new Unit("millimeter", "s", new Big("25.4"));

    readonly singularName: string;
    readonly pluralName: string;
    readonly perInch: Big;

    private constructor(singularName: string, pluralSuffix: string, perInch: Big) {
        this.singularName = singularName;
        this.pluralName = singularName + pluralSuffix;
        this.perInch = perInch;
    }

    public static values(): Unit[] {
        return [Unit.INCHES, Unit.CENTIMETERS, Unit.MILLIMETERS];
    }
}
