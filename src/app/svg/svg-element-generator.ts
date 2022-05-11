import Big from "big.js";

import OrderedPair from "app/common/ordered-pair";
import { roundAndStrip, ZERO } from "app/misc/big-util";
import type ModelPath from "app/models/path";
import Shape from "app/models/shape";
import VectorNumber, { CHARACTER_HEIGHT, CHARACTER_WIDTH } from "app/models/vector-number";
import SvgPath from "app/svg/path";
import type Rect from "app/svg/rect";

/**
 * A simple, not very flexible utility for serializing SVG elements to strings for manual SVG file construction.
 * To be replaced by an SVG library later.
 * @author adashrod@gmail.com
 */
export default class SvgElementGenerator {
    public modelPathToSvgPath(path: ModelPath): SvgPath {
        const result = new SvgPath();
        Array.prototype.push.apply(result.multiPartPath, path.points);
        if (path.isClosed) {
            result.multiPartPath.push(path.points[0]);
        }
        return result;
    }

    public pathToSvgText(path: SvgPath, fpPrecision: number): string {
        let dAttrBuilder = "M";
        if (path.multiPartPath.length === 0) {
            dAttrBuilder += ` ${roundAndStrip(path.start.x, fpPrecision)},${roundAndStrip(path.start.y, fpPrecision)} ` +
                `${roundAndStrip(path.end.x, fpPrecision)},${roundAndStrip(path.end.y, fpPrecision)}`;
        } else {
            for (const point of path.multiPartPath) {
                dAttrBuilder += ` ${roundAndStrip(point.x, fpPrecision)},${roundAndStrip(point.y, fpPrecision)}`;
            }
            if (path.multiPartPath[0].equals(path.multiPartPath[path.multiPartPath.length - 1])) {
                dAttrBuilder += " Z"; // closed path
            }
        }
        return `<path style="${path.style}" d="${dAttrBuilder}" id="${path.id ?? ""}"/>`;
    }

    public rectToSvgText(rect: Rect, fpPrecision: number): string {
        return `<rect style="${rect.style}" x="${roundAndStrip(rect.x, fpPrecision)}" y="${roundAndStrip(rect.y, fpPrecision)}" ` +
            `width="${roundAndStrip(rect.width, fpPrecision)}" height="${roundAndStrip(rect.height, fpPrecision)}"/>`;
    }

    public vectorNumberToSvgText(vectorNumber: VectorNumber, fpPrecision: number): string {
        const vnStr = vectorNumber.number.toString();
        const stringShape = new Shape();
        for (let i = 0; i < vnStr.length; i++) {
            const c = vnStr.charAt(i);
            const charShape = VectorNumber.characterToShape(c);
            const currentWidth = i * CHARACTER_WIDTH;
            charShape.translate(new OrderedPair(new Big(currentWidth), ZERO));
            stringShape.addShape(charShape);
        }
        stringShape.scale(new OrderedPair(vectorNumber.width.div(CHARACTER_WIDTH * vnStr.length),
            vectorNumber.height.div(CHARACTER_HEIGHT))).translate(vectorNumber.position);
        let svgTextBuilder = "";
        for (const path of stringShape.paths) {
            const svgPath = this.modelPathToSvgPath(path);
            svgPath.style = svgPath.style.replace("000000", "0000ff");
            svgTextBuilder += this.pathToSvgText(svgPath, fpPrecision);
        }
        return svgTextBuilder.toString();
    }
}
