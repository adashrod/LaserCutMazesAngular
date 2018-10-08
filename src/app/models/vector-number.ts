import Big from "big.js";

import OrderedPair from "app/common/ordered-pair";
import Path from "app/models/path";
import Shape from "app/models/shape";

/**
 * A VectorNumber is a model with a numeric value, and context of width, height, and position
 * @author adashrod@gmail.com
 */
export default class VectorNumber {
    private static charMap = buildCharMap();

    readonly number: number;
    readonly width: Big;
    readonly height: Big;
    readonly position: OrderedPair<Big>;

    constructor(number: number, width: Big, height: Big, position: OrderedPair<Big>) {
        this.number = number;
        this.width = width;
        this.height = height;
        this.position = position;
    }

    /**
     * Given a digit character, returns a {@link Shape} with points describing the shape of that numeral
     * @param c a digit char
     * @return a shape that looks like the numeral
     */
    static characterToShape(c: string): Shape {
        const shape = VectorNumber.charMap[c];
        if (typeof shape !== "undefined") {
            return Shape.copy(shape);
        }
        throw new Error(`"${c}" is not a valid character for VectorNumber`);
    }

    translate(delta: OrderedPair<Big>): VectorNumber {
        this.position.x = this.position.x.add(delta.x);
        this.position.y = this.position.y.add(delta.y);
        return this;
    }
}

function buildCharMap(): Object {
    const map = {};
    const zero = new Shape();
    const one = new Shape();
    const two = new Shape();
    const three = new Shape();
    const four = new Shape();
    const five = new Shape();
    const six = new Shape();
    const seven = new Shape();
    const eight = new Shape();
    const nine = new Shape();
    map["0"] = zero;
    map["1"] = one;
    map["2"] = two;
    map["3"] = three;
    map["4"] = four;
    map["5"] = five;
    map["6"] = six;
    map["7"] = seven;
    map["8"] = eight;
    map["9"] = nine;
    const zeroPath = new Path();
    zeroPath.addPoint(new OrderedPair(new Big(5), new Big(3)))
        .addPoint(new OrderedPair(new Big(4), new Big(1)))
        .addPoint(new OrderedPair(new Big(2), new Big(1)))
        .addPoint(new OrderedPair(new Big(1), new Big(3)))
        .addPoint(new OrderedPair(new Big(1), new Big(7)))
        .addPoint(new OrderedPair(new Big(2), new Big(9)))
        .addPoint(new OrderedPair(new Big(4), new Big(9)))
        .addPoint(new OrderedPair(new Big(5), new Big(7)))
        .setClosed(true);
    zero.addPath(zeroPath);
    const onePathMain = new Path(), onePathBase = new Path();
    onePathMain.addPoint(new OrderedPair(new Big(2), new Big(2)))
        .addPoint(new OrderedPair(new Big(3), new Big(1)))
        .addPoint(new OrderedPair(new Big(3), new Big(9)))
        .setClosed(false);
    onePathBase.addPoint(new OrderedPair(new Big(2), new Big(9)))
        .addPoint(new OrderedPair(new Big(4), new Big(9)))
        .setClosed(false);
    one.addPath(onePathMain).addPath(onePathBase);
    const twoPath = new Path();
    twoPath.addPoint(new OrderedPair(new Big(1), new Big(2)))
        .addPoint(new OrderedPair(new Big(2), new Big(1)))
        .addPoint(new OrderedPair(new Big(4), new Big(1)))
        .addPoint(new OrderedPair(new Big(5), new Big(2)))
        .addPoint(new OrderedPair(new Big(5), new Big(4)))
        .addPoint(new OrderedPair(new Big(1), new Big(9)))
        .addPoint(new OrderedPair(new Big(5), new Big(9)))
        .setClosed(false);
    two.addPath(twoPath);
    const threePathTop = new Path(), threePathBottom = new Path();
    threePathTop.addPoint(new OrderedPair(new Big(1), new Big(2)))
        .addPoint(new OrderedPair(new Big(2), new Big(1)))
        .addPoint(new OrderedPair(new Big(4), new Big(1)))
        .addPoint(new OrderedPair(new Big(5), new Big(2)))
        .addPoint(new OrderedPair(new Big(5), new Big(4)))
        .addPoint(new OrderedPair(new Big(4), new Big(5)))
        .addPoint(new OrderedPair(new Big(2), new Big(5)))
        .setClosed(false);
    threePathBottom.addPoint(new OrderedPair(new Big(4), new Big(5)))
        .addPoint(new OrderedPair(new Big(5), new Big(6)))
        .addPoint(new OrderedPair(new Big(5), new Big(8)))
        .addPoint(new OrderedPair(new Big(4), new Big(9)))
        .addPoint(new OrderedPair(new Big(2), new Big(9)))
        .addPoint(new OrderedPair(new Big(1), new Big(8)))
        .setClosed(false);
    three.addPath(threePathTop).addPath(threePathBottom);
    const fourPathBent = new Path(), fourPathStem = new Path(new OrderedPair(new Big(4), new Big(1)),
        new OrderedPair(new Big(4), new Big(9)));
    fourPathBent.addPoint(new OrderedPair(new Big(4), new Big(1)))
        .addPoint(new OrderedPair(new Big(1), new Big(5)))
        .addPoint(new OrderedPair(new Big(5), new Big(5)))
        .setClosed(false);
    four.addPath(fourPathBent).addPath(fourPathStem);
    const fivePath = new Path();
    fivePath.addPoint(new OrderedPair(new Big(5), new Big(1)))
        .addPoint(new OrderedPair(new Big(1), new Big(1)))
        .addPoint(new OrderedPair(new Big(1), new Big(5)))
        .addPoint(new OrderedPair(new Big(4), new Big(5)))
        .addPoint(new OrderedPair(new Big(5), new Big(6)))
        .addPoint(new OrderedPair(new Big(5), new Big(8)))
        .addPoint(new OrderedPair(new Big(4), new Big(9)))
        .addPoint(new OrderedPair(new Big(2), new Big(9)))
        .addPoint(new OrderedPair(new Big(1), new Big(8)))
        .setClosed(false);
    five.addPath(fivePath);
    const sixPath = new Path();
    sixPath.addPoint(new OrderedPair(new Big(5), new Big(2)))
        .addPoint(new OrderedPair(new Big(4), new Big(1)))
        .addPoint(new OrderedPair(new Big(2), new Big(1)))
        .addPoint(new OrderedPair(new Big(1), new Big(2)))
        .addPoint(new OrderedPair(new Big(1), new Big(8)))
        .addPoint(new OrderedPair(new Big(2), new Big(9)))
        .addPoint(new OrderedPair(new Big(4), new Big(9)))
        .addPoint(new OrderedPair(new Big(5), new Big(8)))
        .addPoint(new OrderedPair(new Big(5), new Big(6)))
        .addPoint(new OrderedPair(new Big(4), new Big(5)))
        .addPoint(new OrderedPair(new Big(2), new Big(5)))
        .addPoint(new OrderedPair(new Big(1), new Big(6)))
        .setClosed(false);
    six.addPath(sixPath);
    const sevenPath = new Path();
    sevenPath.addPoint(new OrderedPair(new Big(1), new Big(1)))
        .addPoint(new OrderedPair(new Big(5), new Big(1)))
        .addPoint(new OrderedPair(new Big(2), new Big(9)))
        .setClosed(false);
    seven.addPath(sevenPath);
    const eightPathTop = new Path(), eightPathBottom = new Path();
    eightPathTop.addPoint(new OrderedPair(new Big(4), new Big(5)))
        .addPoint(new OrderedPair(new Big(5), new Big(4)))
        .addPoint(new OrderedPair(new Big(5), new Big(2)))
        .addPoint(new OrderedPair(new Big(4), new Big(1)))
        .addPoint(new OrderedPair(new Big(2), new Big(1)))
        .addPoint(new OrderedPair(new Big(1), new Big(2)))
        .addPoint(new OrderedPair(new Big(1), new Big(4)))
        .addPoint(new OrderedPair(new Big(2), new Big(5)))
        .setClosed(true);
    eightPathBottom.addPoint(new OrderedPair(new Big(4), new Big(5)))
        .addPoint(new OrderedPair(new Big(5), new Big(6)))
        .addPoint(new OrderedPair(new Big(5), new Big(8)))
        .addPoint(new OrderedPair(new Big(4), new Big(9)))
        .addPoint(new OrderedPair(new Big(2), new Big(9)))
        .addPoint(new OrderedPair(new Big(1), new Big(8)))
        .addPoint(new OrderedPair(new Big(1), new Big(6)))
        .addPoint(new OrderedPair(new Big(2), new Big(5)))
        .setClosed(false);
    eight.addPath(eightPathTop).addPath(eightPathBottom);
    const ninePath = new Path();
    ninePath.addPoint(new OrderedPair(new Big(5), new Big(4)))
        .addPoint(new OrderedPair(new Big(4), new Big(5)))
        .addPoint(new OrderedPair(new Big(2), new Big(5)))
        .addPoint(new OrderedPair(new Big(1), new Big(4)))
        .addPoint(new OrderedPair(new Big(1), new Big(2)))
        .addPoint(new OrderedPair(new Big(2), new Big(1)))
        .addPoint(new OrderedPair(new Big(4), new Big(1)))
        .addPoint(new OrderedPair(new Big(5), new Big(2)))
        .addPoint(new OrderedPair(new Big(5), new Big(8)))
        .addPoint(new OrderedPair(new Big(4), new Big(9)))
        .addPoint(new OrderedPair(new Big(2), new Big(9)))
        .addPoint(new OrderedPair(new Big(1), new Big(8)))
        .setClosed(false);
    nine.addPath(ninePath);
    return map;
}

export const CHARACTER_WIDTH = 6;
export const CHARACTER_HEIGHT = 10;
