import Big from "big.js";

export function min(a: Big, b: Big): Big {
    return a.lt(b) ? a : b;
}

export function max(a: Big, b: Big): Big {
    return a.gt(b) ? a : b;
}

export function roundAndStrip(num: Big, precision: number) {
    const s = num.toFixed(precision);
    const dot = s.indexOf(".");
    if (dot === -1) {
        return s;
    }
    let i;
    for (i = s.length - 1; i >= 0; i--) {
        if (s.charAt(i) !== "0") {
            break;
        }
    }
    if (s.charAt(i) === ".") {
        return s.substring(0, i);
    }
    return s.substring(0, i + 1);
}

export const ZERO = new Big(0);
export const HALF = new Big(".5");
