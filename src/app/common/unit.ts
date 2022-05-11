import Big from "big.js";

export default class Unit {
    public static INCHES: Unit = new Unit("inch", "es", new Big(1));
    public static CENTIMETERS: Unit = new Unit("centimeter", "s", new Big("2.54"));
    public static MILLIMETERS: Unit = new Unit("millimeter", "s", new Big("25.4"));

    public readonly singularName: string;
    public readonly pluralName: string;
    public readonly perInch: Big;

    private constructor(singularName: string, pluralSuffix: string, perInch: Big) {
        this.singularName = singularName;
        this.pluralName = singularName + pluralSuffix;
        this.perInch = perInch;
    }

    public static values(): Unit[] {
        return [Unit.INCHES, Unit.CENTIMETERS, Unit.MILLIMETERS];
    }
}
