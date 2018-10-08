export default class PrintMode {
    static FLOOR_AND_WALL: PrintMode = new PrintMode("Floor and Wall");
    static SINGLE_SHEET: PrintMode = new PrintMode("Single Sheet");

    readonly name: string;

    private constructor(name: string) {
        this.name = name;
    }

    public static values(): PrintMode[] {
        return [PrintMode.FLOOR_AND_WALL, PrintMode.SINGLE_SHEET];
    }
}
