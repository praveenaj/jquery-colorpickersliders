// TinyColor v0.9.16
// https://github.com/bgrins/TinyColor
// 2013-08-10, Brian Grinstead, MIT License

(function() {

var trimLeft = /^[\s,#]+/,
    trimRight = /\s+$/,
    tinyCounter = 0,
    math = Math,
    mathRound = math.round,
    mathMin = math.min,
    mathMax = math.max,
    mathRandom = math.random;

function tinycolor (color, opts) {

    color = (color) ? color : '';
    opts = opts || { };

    // If input is already a tinycolor, return itself
    if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
       return color;
    }

    var rgb = inputToRGB(color);
    var r = rgb.r,
        g = rgb.g,
        b = rgb.b,
        a = rgb.a,
        roundA = mathRound(100*a) / 100,
        format = opts.format || rgb.format;

    // Don't let the range of [0,255] come back in [0,1].
    // Potentially lose a little bit of precision here, but will fix issues where
    // .5 gets interpreted as half of the total, instead of half of 1
    // If it was supposed to be 128, this was already taken care of by `inputToRgb`
    if (r < 1) { r = mathRound(r); }
    if (g < 1) { g = mathRound(g); }
    if (b < 1) { b = mathRound(b); }

    return {
        ok: rgb.ok,
        format: format,
        _tc_id: tinyCounter++,
        alpha: a,
        getAlpha: function() {
            return a;
        },
        setAlpha: function(value) {
            a = boundAlpha(value);
            roundA = mathRound(100*a) / 100;
        },
        toHsv: function() {
            var hsv = rgbToHsv(r, g, b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: a };
        },
        toHsvString: function() {
            var hsv = rgbToHsv(r, g, b);
            var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
            return (a == 1) ?
              "hsv("  + h + ", " + s + "%, " + v + "%)" :
              "hsva(" + h + ", " + s + "%, " + v + "%, "+ roundA + ")";
        },
        toHsl: function() {
            var hsl = rgbToHsl(r, g, b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: a };
        },
        toHslString: function() {
            var hsl = rgbToHsl(r, g, b);
            var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
            return (a == 1) ?
              "hsl("  + h + ", " + s + "%, " + l + "%)" :
              "hsla(" + h + ", " + s + "%, " + l + "%, "+ roundA + ")";
        },
        toHex: function(allow3Char) {
            return rgbToHex(r, g, b, allow3Char);
        },
        toHexString: function(allow3Char) {
            return '#' + rgbToHex(r, g, b, allow3Char);
        },
        toRgb: function() {
            return { r: mathRound(r), g: mathRound(g), b: mathRound(b), a: a };
        },
        toRgbString: function() {
            return (a == 1) ?
              "rgb("  + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ")" :
              "rgba(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ", " + roundA + ")";
        },
        toPercentageRgb: function() {
            return { r: mathRound(bound01(r, 255) * 100) + "%", g: mathRound(bound01(g, 255) * 100) + "%", b: mathRound(bound01(b, 255) * 100) + "%", a: a };
        },
        toPercentageRgbString: function() {
            return (a == 1) ?
              "rgb("  + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%)" :
              "rgba(" + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%, " + roundA + ")";
        },
        toName: function() {
            if (a === 0) {
                return "transparent";
            }

            return hexNames[rgbToHex(r, g, b, true)] || false;
        },
        toFilter: function(secondColor) {
            var hex = rgbToHex(r, g, b);
            var secondHex = hex;
            var alphaHex = Math.round(parseFloat(a) * 255).toString(16);
            var secondAlphaHex = alphaHex;
            var gradientType = opts && opts.gradientType ? "GradientType = 1, " : "";

            if (secondColor) {
                var s = tinycolor(secondColor);
                secondHex = s.toHex();
                secondAlphaHex = Math.round(parseFloat(s.alpha) * 255).toString(16);
            }

            return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr=#" + pad2(alphaHex) + hex + ",endColorstr=#" + pad2(secondAlphaHex) + secondHex + ")";
        },
        toString: function(format) {
            var formatSet = !!format;
            format = format || this.format;

            var formattedString = false;
            var hasAlphaAndFormatNotSet = !formatSet && a < 1 && a > 0;
            var formatWithAlpha = hasAlphaAndFormatNotSet && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "prgb") {
                formattedString = this.toPercentageRgbString();
            }
            if (format === "hex" || format === "hex6") {
                formattedString = this.toHexString();
            }
            if (format === "hex3") {
                formattedString = this.toHexString(true);
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }

            if (formatWithAlpha) {
                return this.toRgbString();
            }

            return formattedString || this.toHexString();
        }
    };
}

// If input is an object, force 1 into "1.0" to handle ratios properly
// String input requires "1.0" as input, so 1 will be treated as 1
tinycolor.fromRatio = function(color, opts) {
    if (typeof color == "object") {
        var newColor = {};
        for (var i in color) {
            if (color.hasOwnProperty(i)) {
                if (i === "a") {
                    newColor[i] = color[i];
                }
                else {
                    newColor[i] = convertToPercentage(color[i]);
                }
            }
        }
        color = newColor;
    }

    return tinycolor(color, opts);
};

// Given a string or object, convert that input to RGB
// Possible string inputs:
//
//     "red"
//     "#f00" or "f00"
//     "#ff0000" or "ff0000"
//     "rgb 255 0 0" or "rgb (255, 0, 0)"
//     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
//     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
//     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
//     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
//     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
//     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
//
function inputToRGB(color) {

    var rgb = { r: 0, g: 0, b: 0 };
    var a = 1;
    var ok = false;
    var format = false;

    if (typeof color == "string") {
        color = stringInputToObject(color);
    }

    if (typeof color == "object") {
        if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
            rgb = rgbToRgb(color.r, color.g, color.b);
            ok = true;
            format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
        }
        else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
            color.s = convertToPercentage(color.s);
            color.v = convertToPercentage(color.v);
            rgb = hsvToRgb(color.h, color.s, color.v);
            ok = true;
            format = "hsv";
        }
        else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
            color.s = convertToPercentage(color.s);
            color.l = convertToPercentage(color.l);
            rgb = hslToRgb(color.h, color.s, color.l);
            ok = true;
            format = "hsl";
        }

        if (color.hasOwnProperty("a")) {
            a = color.a;
        }
    }

    a = boundAlpha(a);

    return {
        ok: ok,
        format: color.format || format,
        r: mathMin(255, mathMax(rgb.r, 0)),
        g: mathMin(255, mathMax(rgb.g, 0)),
        b: mathMin(255, mathMax(rgb.b, 0)),
        a: a
    };
}


// Conversion Functions
// --------------------

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
function rgbToRgb(r, g, b){
    return {
        r: bound01(r, 255) * 255,
        g: bound01(g, 255) * 255,
        b: bound01(b, 255) * 255
    };
}

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
function rgbToHsl(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min) {
        h = s = 0; // achromatic
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h: h, s: s, l: l };
}

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
function hslToRgb(h, s, l) {
    var r, g, b;

    h = bound01(h, 360);
    s = bound01(s, 100);
    l = bound01(l, 100);

    function hue2rgb(p, q, t) {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    if(s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
function rgbToHsv(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if(max == min) {
        h = 0; // achromatic
    }
    else {
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
 function hsvToRgb(h, s, v) {

    h = bound01(h, 360) * 6;
    s = bound01(s, 100);
    v = bound01(v, 100);

    var i = math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
function rgbToHex(r, g, b, allow3Char) {

    var hex = [
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16))
    ];

    // Return a 3 character hex if possible
    if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }

    return hex.join("");
}

// `equals`
// Can be called with any tinycolor input
tinycolor.equals = function (color1, color2) {
    if (!color1 || !color2) { return false; }
    return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
};
tinycolor.random = function() {
    return tinycolor.fromRatio({
        r: mathRandom(),
        g: mathRandom(),
        b: mathRandom()
    });
};


// Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

tinycolor.desaturate = function (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s -= amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
};
tinycolor.saturate = function (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s += amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
};
tinycolor.greyscale = function(color) {
    return tinycolor.desaturate(color, 100);
};
tinycolor.lighten = function(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l += amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
};
tinycolor.darken = function (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l -= amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
};
tinycolor.complement = function(color) {
    var hsl = tinycolor(color).toHsl();
    hsl.h = (hsl.h + 180) % 360;
    return tinycolor(hsl);
};


// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

tinycolor.triad = function(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
    ];
};
tinycolor.tetrad = function(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
    ];
};
tinycolor.splitcomplement = function(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
        tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
    ];
};
tinycolor.analogous = function(color, results, slices) {
    results = results || 6;
    slices = slices || 30;

    var hsl = tinycolor(color).toHsl();
    var part = 360 / slices;
    var ret = [tinycolor(color)];

    for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
        hsl.h = (hsl.h + part) % 360;
        ret.push(tinycolor(hsl));
    }
    return ret;
};
tinycolor.monochromatic = function(color, results) {
    results = results || 6;
    var hsv = tinycolor(color).toHsv();
    var h = hsv.h, s = hsv.s, v = hsv.v;
    var ret = [];
    var modification = 1 / results;

    while (results--) {
        ret.push(tinycolor({ h: h, s: s, v: v}));
        v = (v + modification) % 1;
    }

    return ret;
};


// Readability Functions
// ---------------------
// <http://www.w3.org/TR/AERT#color-contrast>

// `readability`
// Analyze the 2 colors and returns an object with the following properties:
//    `brightness`: difference in brightness between the two colors
//    `color`: difference in color/hue between the two colors
tinycolor.readability = function(color1, color2) {
    var a = tinycolor(color1).toRgb();
    var b = tinycolor(color2).toRgb();
    var brightnessA = (a.r * 299 + a.g * 587 + a.b * 114) / 1000;
    var brightnessB = (b.r * 299 + b.g * 587 + b.b * 114) / 1000;
    var colorDiff = (
        Math.max(a.r, b.r) - Math.min(a.r, b.r) +
        Math.max(a.g, b.g) - Math.min(a.g, b.g) +
        Math.max(a.b, b.b) - Math.min(a.b, b.b)
    );

    return {
        brightness: Math.abs(brightnessA - brightnessB),
        color: colorDiff
    };
};

// `readable`
// http://www.w3.org/TR/AERT#color-contrast
// Ensure that foreground and background color combinations provide sufficient contrast.
// *Example*
//    tinycolor.readable("#000", "#111") => false
tinycolor.readable = function(color1, color2) {
    var readability = tinycolor.readability(color1, color2);
    return readability.brightness > 125 && readability.color > 500;
};

// `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// *Example*
//    tinycolor.mostReadable("#123", ["#fff", "#000"]) => "#000"
tinycolor.mostReadable = function(baseColor, colorList) {
    var bestColor = null;
    var bestScore = 0;
    var bestIsReadable = false;
    for (var i=0; i < colorList.length; i++) {

        // We normalize both around the "acceptable" breaking point,
        // but rank brightness constrast higher than hue.

        var readability = tinycolor.readability(baseColor, colorList[i]);
        var readable = readability.brightness > 125 && readability.color > 500;
        var score = 3 * (readability.brightness / 125) + (readability.color / 500);

        if ((readable && ! bestIsReadable) ||
            (readable && bestIsReadable && score > bestScore) ||
            ((! readable) && (! bestIsReadable) && score > bestScore)) {
            bestIsReadable = readable;
            bestScore = score;
            bestColor = tinycolor(colorList[i]);
        }
    }
    return bestColor;
};


// Big List of Colors
// ------------------
// <http://www.w3.org/TR/css3-color/#svg-color>
var names = tinycolor.names = {
    aliceblue: "f0f8ff",
    antiquewhite: "faebd7",
    aqua: "0ff",
    aquamarine: "7fffd4",
    azure: "f0ffff",
    beige: "f5f5dc",
    bisque: "ffe4c4",
    black: "000",
    blanchedalmond: "ffebcd",
    blue: "00f",
    blueviolet: "8a2be2",
    brown: "a52a2a",
    burlywood: "deb887",
    burntsienna: "ea7e5d",
    cadetblue: "5f9ea0",
    chartreuse: "7fff00",
    chocolate: "d2691e",
    coral: "ff7f50",
    cornflowerblue: "6495ed",
    cornsilk: "fff8dc",
    crimson: "dc143c",
    cyan: "0ff",
    darkblue: "00008b",
    darkcyan: "008b8b",
    darkgoldenrod: "b8860b",
    darkgray: "a9a9a9",
    darkgreen: "006400",
    darkgrey: "a9a9a9",
    darkkhaki: "bdb76b",
    darkmagenta: "8b008b",
    darkolivegreen: "556b2f",
    darkorange: "ff8c00",
    darkorchid: "9932cc",
    darkred: "8b0000",
    darksalmon: "e9967a",
    darkseagreen: "8fbc8f",
    darkslateblue: "483d8b",
    darkslategray: "2f4f4f",
    darkslategrey: "2f4f4f",
    darkturquoise: "00ced1",
    darkviolet: "9400d3",
    deeppink: "ff1493",
    deepskyblue: "00bfff",
    dimgray: "696969",
    dimgrey: "696969",
    dodgerblue: "1e90ff",
    firebrick: "b22222",
    floralwhite: "fffaf0",
    forestgreen: "228b22",
    fuchsia: "f0f",
    gainsboro: "dcdcdc",
    ghostwhite: "f8f8ff",
    gold: "ffd700",
    goldenrod: "daa520",
    gray: "808080",
    green: "008000",
    greenyellow: "adff2f",
    grey: "808080",
    honeydew: "f0fff0",
    hotpink: "ff69b4",
    indianred: "cd5c5c",
    indigo: "4b0082",
    ivory: "fffff0",
    khaki: "f0e68c",
    lavender: "e6e6fa",
    lavenderblush: "fff0f5",
    lawngreen: "7cfc00",
    lemonchiffon: "fffacd",
    lightblue: "add8e6",
    lightcoral: "f08080",
    lightcyan: "e0ffff",
    lightgoldenrodyellow: "fafad2",
    lightgray: "d3d3d3",
    lightgreen: "90ee90",
    lightgrey: "d3d3d3",
    lightpink: "ffb6c1",
    lightsalmon: "ffa07a",
    lightseagreen: "20b2aa",
    lightskyblue: "87cefa",
    lightslategray: "789",
    lightslategrey: "789",
    lightsteelblue: "b0c4de",
    lightyellow: "ffffe0",
    lime: "0f0",
    limegreen: "32cd32",
    linen: "faf0e6",
    magenta: "f0f",
    maroon: "800000",
    mediumaquamarine: "66cdaa",
    mediumblue: "0000cd",
    mediumorchid: "ba55d3",
    mediumpurple: "9370db",
    mediumseagreen: "3cb371",
    mediumslateblue: "7b68ee",
    mediumspringgreen: "00fa9a",
    mediumturquoise: "48d1cc",
    mediumvioletred: "c71585",
    midnightblue: "191970",
    mintcream: "f5fffa",
    mistyrose: "ffe4e1",
    moccasin: "ffe4b5",
    navajowhite: "ffdead",
    navy: "000080",
    oldlace: "fdf5e6",
    olive: "808000",
    olivedrab: "6b8e23",
    orange: "ffa500",
    orangered: "ff4500",
    orchid: "da70d6",
    palegoldenrod: "eee8aa",
    palegreen: "98fb98",
    paleturquoise: "afeeee",
    palevioletred: "db7093",
    papayawhip: "ffefd5",
    peachpuff: "ffdab9",
    peru: "cd853f",
    pink: "ffc0cb",
    plum: "dda0dd",
    powderblue: "b0e0e6",
    purple: "800080",
    red: "f00",
    rosybrown: "bc8f8f",
    royalblue: "4169e1",
    saddlebrown: "8b4513",
    salmon: "fa8072",
    sandybrown: "f4a460",
    seagreen: "2e8b57",
    seashell: "fff5ee",
    sienna: "a0522d",
    silver: "c0c0c0",
    skyblue: "87ceeb",
    slateblue: "6a5acd",
    slategray: "708090",
    slategrey: "708090",
    snow: "fffafa",
    springgreen: "00ff7f",
    steelblue: "4682b4",
    tan: "d2b48c",
    teal: "008080",
    thistle: "d8bfd8",
    tomato: "ff6347",
    turquoise: "40e0d0",
    violet: "ee82ee",
    wheat: "f5deb3",
    white: "fff",
    whitesmoke: "f5f5f5",
    yellow: "ff0",
    yellowgreen: "9acd32"
};

// Make it easy to access colors via `hexNames[hex]`
var hexNames = tinycolor.hexNames = flip(names);


// Utilities
// ---------

// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
function flip(o) {
    var flipped = { };
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            flipped[o[i]] = i;
        }
    }
    return flipped;
}

// Return a valid alpha value [0,1] with all invalid values being set to 1
function boundAlpha(a) {
    a = parseFloat(a);

    if (isNaN(a) || a < 0 || a > 1) {
        a = 1;
    }

    return a;
}

// Take input from [0, n] and return it as [0, 1]
function bound01(n, max) {
    if (isOnePointZero(n)) { n = "100%"; }

    var processPercent = isPercentage(n);
    n = mathMin(max, mathMax(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if ((math.abs(n - max) < 0.000001)) {
        return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return (n % max) / parseFloat(max);
}

// Force a number between 0 and 1
function clamp01(val) {
    return mathMin(1, mathMax(0, val));
}

// Parse an integer into hex
function parseHex(val) {
    return parseInt(val, 16);
}

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
function isOnePointZero(n) {
    return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
}

// Check to see if string passed in is a percentage
function isPercentage(n) {
    return typeof n === "string" && n.indexOf('%') != -1;
}

// Force a hex value to have 2 characters
function pad2(c) {
    return c.length == 1 ? '0' + c : '' + c;
}

// Replace a decimal with it's percentage value
function convertToPercentage(n) {
    if (n <= 1) {
        n = (n * 100) + "%";
    }

    return n;
}

var matchers = (function() {

    // <http://www.w3.org/TR/css3-values/#integers>
    var CSS_INTEGER = "[-\\+]?\\d+%?";

    // <http://www.w3.org/TR/css3-values/#number-value>
    var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

    // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
    var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

    // Actual matching.
    // Parentheses and commas are optional, but not required.
    // Whitespace can take the place of commas or opening paren
    var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
    var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

    return {
        rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
        rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
        hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
        hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
        hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
        hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
    };
})();

// `stringInputToObject`
// Permissive string parsing.  Take in a number of formats, and output an object
// based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
function stringInputToObject(color) {

    color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
    var named = false;
    if (names[color]) {
        color = names[color];
        named = true;
    }
    else if (color == 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0, format: "name" };
    }

    // Try to match string input using regular expressions.
    // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
    // Just return an object and let the conversion functions handle that.
    // This way the result will be the same whether the tinycolor is initialized with string or object.
    var match;
    if ((match = matchers.rgb.exec(color))) {
        return { r: match[1], g: match[2], b: match[3] };
    }
    if ((match = matchers.rgba.exec(color))) {
        return { r: match[1], g: match[2], b: match[3], a: match[4] };
    }
    if ((match = matchers.hsl.exec(color))) {
        return { h: match[1], s: match[2], l: match[3] };
    }
    if ((match = matchers.hsla.exec(color))) {
        return { h: match[1], s: match[2], l: match[3], a: match[4] };
    }
    if ((match = matchers.hsv.exec(color))) {
        return { h: match[1], s: match[2], v: match[3] };
    }
    if ((match = matchers.hex6.exec(color))) {
        return {
            r: parseHex(match[1]),
            g: parseHex(match[2]),
            b: parseHex(match[3]),
            format: named ? "name" : "hex"
        };
    }
    if ((match = matchers.hex3.exec(color))) {
        return {
            r: parseHex(match[1] + '' + match[1]),
            g: parseHex(match[2] + '' + match[2]),
            b: parseHex(match[3] + '' + match[3]),
            format: named ? "name" : "hex"
        };
    }

    return false;
}


window.tinycolor = tinycolor;

})();


/*jshint undef: true, unused:true, browser:true */
/*global jQuery: true, tinycolor: false */

/*!=========================================================================
 *  jQuery Color Picker Sliders
 *  v4.1.7
 *
 *  An advanced responsive color selector with color swatches and support for
 *  human perceived lightness. Works in all modern browsers and on touch devices.
 *
 *      https://github.com/istvan-ujjmeszaros/jquery-colorpickersliders
 *      http://virtuosoft.eu/code/jquery-colorpickersliders/
 *
 *  Copyright 2013 István Ujj-Mészáros
 *
 *  Thanks for the contributors:
 *      imaguiraga - https://github.com/imaguiraga
 *      balmasich - https://github.com/balmasich
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  Requirements:
 *
 *      TinyColor: https://github.com/bgrins/TinyColor
 *
 *  Using color math algorithms from EasyRGB Web site:
 *      http://www.easyrgb.com/index.php?X=MATH
 * ====================================================================== */

(function($) {
    "use strict";

    $.fn.ColorPickerSliders = function(options) {

        return this.each(function() {

            var alreadyinitialized = false,
                    settings,
                    triggerelement = $(this),
                    triggerelementisinput = triggerelement.is("input"),
                    container,
                    elements,
                    swatches,
                    rendermode = false,
                    MAXLIGHT = 101, // 101 needed for bright colors (maybe due to rounding errors)
                    dragTarget = false,
                    lastUpdateTime = 0,
                    color = {
                        tiny: null,
                        hsla: null,
                        rgba: null,
                        cielch: null
                    },
            MAXVALIDCHROMA = 144;   // maximum valid chroma value found convertible to rgb (blue)

            init();

            function init() {
                if (alreadyinitialized) {
                    return;
                }

                alreadyinitialized = true;

                rendermode = $.fn.ColorPickerSliders.detectWhichGradientIsSupported();

                if (rendermode === "filter") {
                    rendermode = false;
                }

                if (!rendermode && $.fn.ColorPickerSliders.svgSupported()) {
                    rendermode = "svg";
                }

                _initSettings();

                // force preview when browser doesn't support css gradients
                if ((!settings.order.hasOwnProperty('preview') || settings.order.preview === false) && !rendermode) {
                    settings.order.preview = 10;
                }

                _buildHtml();
                _initElements();

                if (triggerelementisinput) {
                    color.tiny = tinycolor(triggerelement.val());

                    if (!color.tiny.format) {
                        color.tiny = tinycolor(settings.color);
                    }
                }
                else {
                    color.tiny = tinycolor(settings.color);
                }

                color.hsla = color.tiny.toHsl();
                color.rgba = color.tiny.toRgb();
                color.cielch = $.fn.ColorPickerSliders.rgb2lch(color.rgba);

                _renderSwatches();
                _bindEvents();

                _updateAllElements();
            }

            function updateColor(newcolor, disableinputupdate) {
                var updatedcolor = tinycolor(newcolor);

                if (updatedcolor.format) {
                    container.removeClass("cp-unconvertible-cie-color");

                    color.tiny = updatedcolor;
                    color.hsla = updatedcolor.toHsl();
                    color.rgba = updatedcolor.toRgb();
                    color.cielch = $.fn.ColorPickerSliders.rgb2lch(color.rgba);

                    _updateAllElements(disableinputupdate);

                    return true;
                }
                else {
                    return false;
                }
            }

            function showPopup() {
                container.data("justshown", true);

                $('.cp-container.cp-popup').hide();

                var viewportwidth = $(window).width(),
                        offset = triggerelement.offset(),
                        popuporiginalwidth;

                popuporiginalwidth = container.data('popup-original-width');

                if (typeof popuporiginalwidth === "undefined") {
                    popuporiginalwidth = container.outerWidth();
                    container.data('popup-original-width', popuporiginalwidth);
                }

                if (offset.left + popuporiginalwidth + 12 <= viewportwidth) {
                    container.css('left', offset.left).width(popuporiginalwidth);
                }
                else if (popuporiginalwidth <= viewportwidth) {
                    container.css('left', viewportwidth - popuporiginalwidth - 12).width(popuporiginalwidth);
                }
                else {
                    container.css('left', 0).width(viewportwidth - 12);
                }

                container.css('top', offset.top + triggerelement.outerHeight()).show();
            }

            function hidePopup() {
                container.hide();
            }

            function _initSettings() {
                settings = $.extend({
                    color: 'hsl(342, 52%, 70%)',
                    preventtouchkeyboardonshow: true,
                    swatches: ['FFFFFF', 'C0C0C0', '808080', '000000', 'FF0000', '800000', 'FFFF00', '808000', '00FF00', '008000', '00FFFF', '008080', '0000FF', '000080', 'FF00FF', '800080'],
                    customswatches: 'colorpickkersliders', // false or a grop name
                    connectedinput: false, // can be a jquery object or a selector
                    flat: false,
                    disableautopopup: false,
                    updateinterval: 30, // update interval of the sliders while in drag (ms)
                    previewontriggerelement: true,
                    previewcontrasttreshold: 15,
                    previewformat: 'rgb', // rgb/hsl/hex
                    erroneousciecolormarkers: true,
                    invalidcolorsopacity: 1, // everything below 1 causes slightly slower responses
                    finercierangeedges: true, // can be disabled for faster responses
                    titleswatchesadd: "Add color to swatches",
                    titleswatchesremove: "Remove color from swatches",
                    titleswatchesreset: "Reset to default swatches",
                    order: {},
                    labels: {},
                    staticHue: false,
                    onchange: function() {
                    }
                }, options);

                if (options.hasOwnProperty('order')) {
                    settings.order = $.extend({
                        opacity: false,
                        hsl: false,
                        rgb: false,
                        cie: false,
                        preview: false
                    }, options.order);
                }
                else {
                    settings.order = {
                        opacity: 0,
                        hsl: 1,
                        rgb: 2,
                        cie: 3, // cie sliders can increase response time of all sliders!
                        preview: 4
                    };
                }

                if (!options.hasOwnProperty('labels')) {
                    options.labels = {};
                }

                settings.labels = $.extend({
                    hslhue: 'HSL-Hue',
                    hslsaturation: 'HSL-Saturation',
                    hsllightness: 'HSL-Lightness',
                    rgbred: 'RGB-Red',
                    rgbgreen: 'RGB-Green',
                    rgbblue: 'RGB-Blue',
                    cielightness: 'CIE-Lightness',
                    ciechroma: 'CIE-Chroma',
                    ciehue: 'CIE-hue',
                    opacity: 'Opacity',
                    preview: 'Preview'
                }, options.labels);
            }

            function _buildHtml() {
                var sliders = [],
                        color_picker_html = '';

                if (settings.order.opacity !== false) {
                    sliders[settings.order.opacity] = '<div class="cp-slider cp-opacity cp-transparency"><span>' + settings.labels.opacity + '</span><div class="cp-marker"></div></div>';
                }

                if (settings.order.hsl !== false) {
                    sliders[settings.order.hsl] = '<div class="cp-slider cp-hslhue cp-transparency"><span>' + settings.labels.hslhue + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-hslsaturation cp-transparency"><span>' + settings.labels.hslsaturation + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-hsllightness cp-transparency"><span>' + settings.labels.hsllightness + '</span><div class="cp-marker"></div></div>';
                }

                if (settings.order.rgb !== false) {
                    sliders[settings.order.rgb] = '<div class="cp-slider cp-rgbred cp-transparency"><span>' + settings.labels.rgbred + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-rgbgreen cp-transparency"><span>' + settings.labels.rgbgreen + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-rgbblue cp-transparency"><span>' + settings.labels.rgbblue + '</span><div class="cp-marker"></div></div>';
                }

                if (settings.order.cie !== false) {
                    sliders[settings.order.cie] = '<div class="cp-slider cp-cielightness cp-transparency"><span>' + settings.labels.cielightness + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-ciechroma cp-transparency"><span>' + settings.labels.ciechroma + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-ciehue cp-transparency"><span>' + settings.labels.ciehue + '</span><div class="cp-marker"></div></div>';
                }

                if (settings.order.preview !== false) {
                    sliders[settings.order.preview] = '<div class="cp-preview cp-transparency"><input type="text" readonly="readonly"></div>';
                }

                color_picker_html += '<div class="cp-sliders">';

                for (var i = 0; i < sliders.length; i++) {
                    if (typeof sliders[i] === "undefined") {
                        continue;
                    }

                    color_picker_html += sliders[i];
                }

                color_picker_html += '</div>';

                if (settings.swatches) {
                    color_picker_html += '<div class="cp-swatches"><button type="button" class="add" title="' + settings.titleswatchesadd + '"></button><button type="button" class="remove" title="' + settings.titleswatchesremove + '"></button><button type="button" class="reset" title="' + settings.titleswatchesreset + '"></button><ul></ul><div style="clear:both"></div></div>';
                }

                if (settings.flat) {
                    if (triggerelementisinput) {
                        container = $('<div class="cp-container"></div>').insertAfter(triggerelement);
                    }
                    else {
                        container = $('<div class="cp-container"></div>');
                        triggerelement.append(container);
                    }
                }
                else {
                    container = $('<div class="cp-container"></div>').appendTo('body');
                }

                container.append(color_picker_html);

                if (settings.connectedinput instanceof jQuery) {
                    settings.connectedinput.add(triggerelement);
                }
                else if (settings.connectedinput === false) {
                    settings.connectedinput = triggerelement;
                }
                else {
                    settings.connectedinput = $(settings.connectedinput).add(triggerelement);
                }

                if (!settings.flat) {
                    container.addClass('cp-popup');
                }
            }

            function _initElements() {
                elements = {
                    connectedinput: false,
                    actualswatch: false,
                    swatchescontainer: $(".cp-swatches", container),
                    swatches: $(".cp-swatches ul", container),
                    swatches_add: $(".cp-swatches button.add", container),
                    swatches_remove: $(".cp-swatches button.remove", container),
                    swatches_reset: $(".cp-swatches button.reset", container),
                    all_sliders: $(".cp-sliders, .cp-preview input", container),
                    sliders: {
                        hue: $(".cp-hslhue span", container),
                        hue_marker: $(".cp-hslhue .cp-marker", container),
                        saturation: $(".cp-hslsaturation span", container),
                        saturation_marker: $(".cp-hslsaturation .cp-marker", container),
                        lightness: $(".cp-hsllightness span", container),
                        lightness_marker: $(".cp-hsllightness .cp-marker", container),
                        opacity: $(".cp-opacity span", container),
                        opacity_marker: $(".cp-opacity .cp-marker", container),
                        red: $(".cp-rgbred span", container),
                        red_marker: $(".cp-rgbred .cp-marker", container),
                        green: $(".cp-rgbgreen span", container),
                        green_marker: $(".cp-rgbgreen .cp-marker", container),
                        blue: $(".cp-rgbblue span", container),
                        blue_marker: $(".cp-rgbblue .cp-marker", container),
                        cielightness: $(".cp-cielightness span", container),
                        cielightness_marker: $(".cp-cielightness .cp-marker", container),
                        ciechroma: $(".cp-ciechroma span", container),
                        ciechroma_marker: $(".cp-ciechroma .cp-marker", container),
                        ciehue: $(".cp-ciehue span", container),
                        ciehue_marker: $(".cp-ciehue .cp-marker", container),
                        preview: $(".cp-preview input", container)
                    }
                };

                if (settings.connectedinput) {
                    if (settings.connectedinput instanceof jQuery) {
                        elements.connectedinput = settings.connectedinput;
                    }
                    else {
                        elements.connectedinput = $(settings.connectedinput);
                    }
                }

                if (!settings.customswatches) {
                    elements.swatches_add.hide();
                    elements.swatches_remove.hide();
                    elements.swatches_reset.hide();
                }
            }

            function  destroyColorPicker() {
                if (container  instanceof jQuery) {
                    hidePopup();
                    container.remove();
                    alreadyinitialized = false;
                }
            }

            function  resetColorPicker() {
                init();
            }

            function _bindEvents() {
                triggerelement.on('colorpickersliders.destroy', function() {
                    destroyColorPicker();
                });

                triggerelement.on('colorpickersliders.reset', function() {
                    resetColorPicker();
                });

                triggerelement.on('colorpickersliders.updateColor', function(e, newcolor) {
                    updateColor(newcolor);
                });

                triggerelement.on('colorpickersliders.showPopup', function() {
                    showPopup();
                });

                triggerelement.on('colorpickersliders.hidePopup', function() {
                    hidePopup();
                });

                $(document).on("colorpickersliders.changeswatches", function() {
                    _renderSwatches();
                });

                if (!settings.flat && !settings.disableautopopup) {
                    // we need tabindex defined to be focusable
                    if (typeof triggerelement.attr("tabindex") === "undefined") {
                        triggerelement.attr("tabindex", -1);
                    }

                    if (settings.preventtouchkeyboardonshow) {
                        $(triggerelement).prop("readonly", true);

                        $(triggerelement).on("click", function(ev) {
                            if (container.data("justshown")) {
                                container.data("justshown", false);
                            }
                            else {
                                $(triggerelement).prop("readonly", false);
                                ev.stopPropagation();
                            }
                        });
                    }

                    // buttons doesn't get focus in webkit browsers
                    // https://bugs.webkit.org/show_bug.cgi?id=22261
                    // and only input and button are focusable on iPad
                    // so it is safer to register click on any other than inputs
                    if (!triggerelementisinput) {
                        $(triggerelement).on("click", function(ev) {
                            showPopup();

                            ev.stopPropagation();
                        });

                        $(document).on("click", function() {
                            hidePopup();
                        });
                    }

                    $(triggerelement).on("focus", function(ev) {
                        showPopup();

                        ev.stopPropagation();
                    });

                    $(triggerelement).on("blur", function(ev) {
                        hidePopup();

                        if (settings.preventtouchkeyboardonshow) {
                            $(triggerelement).prop("readonly", true);
                        }

                        ev.stopPropagation();
                    });

                    container.on("touchstart mousedown", function(ev) {
                        ev.preventDefault();
                        ev.stopPropagation();

                        return false;
                    });
                }

                container.on("contextmenu", function(ev) {
                    ev.preventDefault();
                    return false;
                });

                elements.swatches.on("click", "li span", function(ev) {
                    var color = $(this).css("background-color");
                    updateColor(color);
                    ev.preventDefault();
                });

                elements.swatches_add.on("click", function(ev) {
                    _addCurrentColorToSwatches();
                    ev.preventDefault();
                });

                elements.swatches_remove.on("click", function(ev) {
                    _removeActualColorFromSwatches();
                    ev.preventDefault();
                });

                elements.swatches_reset.on("click", function(ev) {
                    _resetSwatches();
                    ev.preventDefault();
                });

                elements.sliders.hue.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "hue";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('hsla', 'h', 3.6 * percent);

                    _updateAllElements();
                });

                elements.sliders.saturation.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "saturation";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('hsla', 's', percent / 100);

                    _updateAllElements();
                });

                elements.sliders.lightness.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "lightness";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('hsla', 'l', percent / 100);

                    _updateAllElements();
                });

                elements.sliders.opacity.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "opacity";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('hsla', 'a', percent / 100);

                    _updateAllElements();
                });

                elements.sliders.red.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "red";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('rgba', 'r', 2.55 * percent);

                    _updateAllElements();
                });

                elements.sliders.green.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "green";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('rgba', 'g', 2.55 * percent);

                    _updateAllElements();
                });

                elements.sliders.blue.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "blue";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('rgba', 'b', 2.55 * percent);

                    _updateAllElements();
                });

                elements.sliders.cielightness.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "cielightness";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('cielch', 'l', (MAXLIGHT / 100) * percent);

                    _updateAllElements();
                });

                elements.sliders.ciechroma.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "ciechroma";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('cielch', 'c', (MAXVALIDCHROMA / 100) * percent);

                    _updateAllElements();
                });

                elements.sliders.ciehue.parent().on("touchstart mousedown", function(ev) {
                    ev.preventDefault();

                    if (ev.which > 1) {
                        return;
                    }

                    dragTarget = "ciehue";

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    _updateColorsProperty('cielch', 'h', 3.6 * percent);

                    _updateAllElements();
                });

                elements.sliders.preview.on("click", function() {
                    this.select();
                });

                $(document).on("touchmove mousemove", function(ev) {
                    if (!dragTarget) {
                        return;
                    }

                    var percent = _updateMarkerPosition(dragTarget, ev);

                    switch (dragTarget) {
                        case "hue":
                            _updateColorsProperty('hsla', 'h', 3.6 * percent);
                            break;
                        case "saturation":
                            _updateColorsProperty('hsla', 's', percent / 100);
                            break;
                        case "lightness":
                            _updateColorsProperty('hsla', 'l', percent / 100);
                            break;
                        case "opacity":
                            _updateColorsProperty('hsla', 'a', percent / 100);
                            break;
                        case "red":
                            _updateColorsProperty('rgba', 'r', 2.55 * percent);
                            break;
                        case "green":
                            _updateColorsProperty('rgba', 'g', 2.55 * percent);
                            break;
                        case "blue":
                            _updateColorsProperty('rgba', 'b', 2.55 * percent);
                            break;
                        case "cielightness":
                            _updateColorsProperty('cielch', 'l', (MAXLIGHT / 100) * percent);
                            break;
                        case "ciechroma":
                            _updateColorsProperty('cielch', 'c', (MAXVALIDCHROMA / 100) * percent);
                            break;
                        case "ciehue":
                            _updateColorsProperty('cielch', 'h', 3.6 * percent);
                            break;
                    }

                    _updateAllElements();

                    ev.preventDefault();
                });

                $(document).on("touchend mouseup", function(ev) {
                    if (ev.which > 1) {
                        return;
                    }

                    if (dragTarget) {
                        dragTarget = false;
                        ev.preventDefault();
                    }
                });

                if (elements.connectedinput) {
                    elements.connectedinput.on('keyup change', function() {
                        var $input = $(this);

                        updateColor($input.val(), true);
                    });
                }

            }

            function _parseCustomSwatches() {
                swatches = [];

                for (var i = 0; i < settings.swatches.length; i++) {
                    var color = tinycolor(settings.swatches[i]);

                    if (color.format) {
                        swatches.push(color.toRgbString());
                    }
                }
            }

            function _renderSwatches() {
                if (!settings.swatches) {
                    return;
                }

                if (settings.customswatches) {
                    var customswatches = false;

                    try {
                        customswatches = JSON.parse(localStorage.getItem("swatches-" + settings.customswatches));
                    }
                    catch (err) {
                    }

                    if (customswatches) {
                        swatches = customswatches;
                    }
                    else {
                        _parseCustomSwatches();
                    }
                }
                else {
                    _parseCustomSwatches();
                }

                if (swatches instanceof Array) {
                    elements.swatches.html("");
                    for (var i = 0; i < swatches.length; i++) {
                        var color = tinycolor(swatches[i]);

                        if (color.format) {
                            elements.swatches.append($("<li></li>").append($("<span></span>").css("background-color", color.toRgbString())));
                        }
                    }
                }

                _findActualColorsSwatch();
            }

            function _findActualColorsSwatch() {
                var found = false;

                $("span", elements.swatches).filter(function() {
                    var swatchcolor = $(this).css('background-color');

                    swatchcolor = tinycolor(swatchcolor);
                    swatchcolor.alpha = Math.round(swatchcolor.alpha * 100) / 100;

                    if (swatchcolor.toRgbString() === color.tiny.toRgbString()) {
                        found = true;

                        var currentswatch = $(this).parent();

                        if (!currentswatch.is(elements.actualswatch)) {
                            if (elements.actualswatch) {
                                elements.actualswatch.removeClass("actual");
                            }
                            elements.actualswatch = currentswatch;
                            currentswatch.addClass("actual");
                        }
                    }
                });

                if (!found) {
                    if (elements.actualswatch) {
                        elements.actualswatch.removeClass("actual");
                        elements.actualswatch = false;
                    }
                }

                if (elements.actualswatch) {
                    elements.swatches_add.prop("disabled", true);
                    elements.swatches_remove.prop("disabled", false);
                }
                else {
                    elements.swatches_add.prop("disabled", false);
                    elements.swatches_remove.prop("disabled", true);
                }
            }

            function _storeSwatches() {
                localStorage.setItem("swatches-" + settings.customswatches, JSON.stringify(swatches));
            }

            function _addCurrentColorToSwatches() {
                swatches.unshift(color.tiny.toRgbString());
                _storeSwatches();

                $(document).trigger("colorpickersliders.changeswatches");
            }

            function _removeActualColorFromSwatches() {
                var index = swatches.indexOf(color.tiny.toRgbString());

                if (index !== -1) {
                    swatches.splice(index, 1);

                    _storeSwatches();
                    $(document).trigger("colorpickersliders.changeswatches");
                }
            }

            function _resetSwatches() {
                if (confirm("Do you really want to reset the swatches? All customizations will be lost!")) {
                    _parseCustomSwatches();

                    _storeSwatches();

                    $(document).trigger("colorpickersliders.changeswatches");
                }
            }

            function _updateColorsProperty(format, property, value) {
                switch (format) {
                    case 'hsla':

                        color.hsla[property] = value;
                        color.tiny = tinycolor({h: color.hsla.h, s: color.hsla.s, l: color.hsla.l, a: color.hsla.a});
                        color.rgba = color.tiny.toRgb();
                        color.cielch = $.fn.ColorPickerSliders.rgb2lch(color.rgba);

                        container.removeClass("cp-unconvertible-cie-color");

                        break;

                    case 'rgba':

                        color.rgba[property] = value;
                        color.tiny = tinycolor({r: color.rgba.r, g: color.rgba.g, b: color.rgba.b, a: color.hsla.a});
                        color.hsla = color.tiny.toHsl();
                        color.cielch = $.fn.ColorPickerSliders.rgb2lch(color.rgba);

                        container.removeClass("cp-unconvertible-cie-color");

                        break;

                    case 'cielch':

                        color.cielch[property] = value;
                        color.rgba = $.fn.ColorPickerSliders.lch2rgb(color.cielch);
                        color.tiny = tinycolor(color.rgba);
                        color.hsla = color.tiny.toHsl();

                        if (settings.erroneousciecolormarkers) {
                            if (color.rgba.isok) {
                                container.removeClass("cp-unconvertible-cie-color");
                            }
                            else {
                                container.addClass("cp-unconvertible-cie-color");
                            }
                        }

                        break;
                }
            }

            function _updateMarkerPosition(slidername, ev) {
                var percent = $.fn.ColorPickerSliders.calculateEventPositionPercentage(ev, elements.sliders[slidername]);

                elements.sliders[slidername + '_marker'].data("position", percent);

                return percent;
            }

            var updateAllElementsTimeout;

            function _updateAllElementsTimer(disableinputupdate) {
                updateAllElementsTimeout = setTimeout(function() {
                    _updateAllElements(disableinputupdate);
                }, settings.updateinterval);
            }

            function _updateAllElements(disableinputupdate) {
                clearTimeout(updateAllElementsTimeout);

                Date.now = Date.now || function() { return +new Date; };

                if (Date.now() - lastUpdateTime < settings.updateinterval) {
                    _updateAllElementsTimer(disableinputupdate);
                    return;
                }

                if (typeof disableinputupdate === "undefined") {
                    disableinputupdate = false;
                }

                lastUpdateTime = Date.now();

                if (settings.order.opacity !== false) {
                    _renderOpacity();
                }

                if (settings.order.hsl !== false) {
                    _renderHue();
                    _renderSaturation();
                    _renderLightness();
                }

                if (settings.order.rgb !== false) {
                    _renderRed();
                    _renderGreen();
                    _renderBlue();
                }

                if (settings.order.cie !== false) {
                    _renderCieLightness();
                    _renderCieChroma();
                    _renderCieHue();
                }

                if (settings.order.preview !== false) {
                    _renderPreview();
                }

                if (!disableinputupdate) {
                    _updateConnectedInput();
                }

                if ((100 - color.cielch.l) * color.cielch.a < settings.previewcontrasttreshold) {
                    elements.all_sliders.css('color', '#000');
                    if (triggerelementisinput && settings.previewontriggerelement) {
                        triggerelement.css('background', color.tiny.toRgbString()).css('color', '#000');
                    }
                }
                else {
                    elements.all_sliders.css('color', '#fff');
                    if (triggerelementisinput && settings.previewontriggerelement) {
                        triggerelement.css('background', color.tiny.toRgbString()).css('color', '#fff');
                    }
                }

                _findActualColorsSwatch();

                settings.onchange(container, color);

                triggerelement.data("color", color);
            }

            function _updateConnectedInput() {
                if (elements.connectedinput) {
                    elements.connectedinput.each(function(index, element) {
                        var $element = $(element),
                            format = $element.data('color-format') || settings.previewformat;

                        switch (format) {
                            case 'hex':
                                $element.val(color.tiny.toHexString());
                                break;
                            case 'hsl':
                                $element.val(color.tiny.toHslString());
                                break;
                            case 'rgb':
                                /* falls through */
                            default:
                                $element.val(color.tiny.toRgbString());
                                break;
                        }
                    });
                }
            }

            function _renderHue() {
                var hsla = $.extend(true, {},color.hsla);
                if(settings.staticHue){
                    hsla.s = 1;
                    hsla.l = 0.5;
                }
                setGradient(elements.sliders.hue, $.fn.ColorPickerSliders.getScaledGradientStops(hsla, "h", 0, 360, 7));

                elements.sliders.hue_marker.css("left", color.hsla.h / 360 * 100 + "%");
            }

            function _renderSaturation() {
                setGradient(elements.sliders.saturation, $.fn.ColorPickerSliders.getScaledGradientStops(color.hsla, "s", 0, 1, 2));

                elements.sliders.saturation_marker.css("left", color.hsla.s * 100 + "%");
            }

            function _renderLightness() {
                setGradient(elements.sliders.lightness, $.fn.ColorPickerSliders.getScaledGradientStops(color.hsla, "l", 0, 1, 3));

                elements.sliders.lightness_marker.css("left", color.hsla.l * 100 + "%");
            }

            function _renderOpacity() {
                setGradient(elements.sliders.opacity, $.fn.ColorPickerSliders.getScaledGradientStops(color.hsla, "a", 0, 1, 2));

                elements.sliders.opacity_marker.css("left", color.hsla.a * 100 + "%");
            }

            function _renderRed() {
                setGradient(elements.sliders.red, $.fn.ColorPickerSliders.getScaledGradientStops(color.rgba, "r", 0, 255, 2));

                elements.sliders.red_marker.css("left", color.rgba.r / 255 * 100 + "%");
            }

            function _renderGreen() {
                setGradient(elements.sliders.green, $.fn.ColorPickerSliders.getScaledGradientStops(color.rgba, "g", 0, 255, 2));

                elements.sliders.green_marker.css("left", color.rgba.g / 255 * 100 + "%");
            }

            function _renderBlue() {
                setGradient(elements.sliders.blue, $.fn.ColorPickerSliders.getScaledGradientStops(color.rgba, "b", 0, 255, 2));

                elements.sliders.blue_marker.css("left", color.rgba.b / 255 * 100 + "%");
            }

            function _extendCieGradientStops(gradientstops, property) {
                if (settings.invalidcolorsopacity === 1 || !settings.finercierangeedges) {
                    return gradientstops;
                }

                gradientstops.sort(function(a, b) {
                    return a.position - b.position;
                });

                var tmparray = [];

                for (var i = 1; i < gradientstops.length; i++) {
                    if (gradientstops[i].isok !== gradientstops[i - 1].isok) {
                        var steps = Math.round(gradientstops[i].position) - Math.round(gradientstops[i - 1].position),
                                extendedgradientstops = $.fn.ColorPickerSliders.getScaledGradientStops(gradientstops[i].rawcolor, property, gradientstops[i - 1].rawcolor[property], gradientstops[i].rawcolor[property], steps, settings.invalidcolorsopacity, gradientstops[i - 1].position, gradientstops[i].position);

                        for (var j = 0; j < extendedgradientstops.length; j++) {
                            if (extendedgradientstops[j].isok !== gradientstops[i - 1].isok) {
                                tmparray.push(extendedgradientstops[j]);

                                if (j > 0) {
                                    tmparray.push(extendedgradientstops[j - 1]);
                                }

                                break;
                            }
                        }
                    }
                }

                return $.merge(tmparray, gradientstops);
            }

            function _renderCieLightness() {
                var gradientstops = $.fn.ColorPickerSliders.getScaledGradientStops(color.cielch, "l", 0, 100, 10, settings.invalidcolorsopacity);

                gradientstops = _extendCieGradientStops(gradientstops, "l");

                setGradient(elements.sliders.cielightness, gradientstops);

                elements.sliders.cielightness_marker.css("left", color.cielch.l / MAXLIGHT * 100 + "%");
            }

            function _renderCieChroma() {
                var gradientstops = $.fn.ColorPickerSliders.getScaledGradientStops(color.cielch, "c", 0, MAXVALIDCHROMA, 5, settings.invalidcolorsopacity);

                gradientstops = _extendCieGradientStops(gradientstops, "c");

                setGradient(elements.sliders.ciechroma, gradientstops);

                elements.sliders.ciechroma_marker.css("left", color.cielch.c / MAXVALIDCHROMA * 100 + "%");
            }

            function _renderCieHue() {
                var gradientstops = $.fn.ColorPickerSliders.getScaledGradientStops(color.cielch, "h", 0, 360, 28, settings.invalidcolorsopacity);

                gradientstops = _extendCieGradientStops(gradientstops, "h");

                setGradient(elements.sliders.ciehue, gradientstops);

                elements.sliders.ciehue_marker.css("left", color.cielch.h / 360 * 100 + "%");
            }

            function _renderPreview() {
                elements.sliders.preview.css("background", $.fn.ColorPickerSliders.csscolor(color.rgba));

                var colorstring;

                switch (settings.previewformat) {
                    case 'hex':
                        colorstring = color.tiny.toHexString();
                        break;
                    case 'hsl':
                        colorstring = color.tiny.toHslString();
                        break;
                    case 'rgb':
                        /* falls through */
                    default:
                        colorstring = color.tiny.toRgbString();
                        break;
                }

                elements.sliders.preview.val(colorstring);
            }

            function setGradient(element, gradientstops) {
                gradientstops.sort(function(a, b) {
                    return a.position - b.position;
                });

                switch(rendermode) {
                    case "noprefix":
                        $.fn.ColorPickerSliders.renderNoprefix(element, gradientstops);
                        break;
                    case "webkit":
                        $.fn.ColorPickerSliders.renderWebkit(element, gradientstops);
                        break;
                    case "ms":
                        $.fn.ColorPickerSliders.renderMs(element, gradientstops);
                        break;
                    case "svg": // can not repeat, radial can be only a covering ellipse (maybe there is a workaround, need more investigation)
                        $.fn.ColorPickerSliders.renderSVG(element, gradientstops);
                        break;
                    case "oldwebkit":   // can not repeat, no percent size with radial gradient (and no ellipse)
                        $.fn.ColorPickerSliders.renderOldwebkit(element, gradientstops);
                        break;
                }
            };

        });

    };

    $.fn.ColorPickerSliders.getEventCoordinates = function(ev) {
        if (typeof ev.pageX !== "undefined") {
            return {
                pageX: ev.originalEvent.pageX,
                pageY: ev.originalEvent.pageY
            };
        }
        else if (typeof ev.originalEvent.touches !== "undefined") {
            return {
                pageX: ev.originalEvent.touches[0].pageX,
                pageY: ev.originalEvent.touches[0].pageY
            };
        }
    };

    $.fn.ColorPickerSliders.calculateEventPositionPercentage = function(ev, containerElement) {
        var c = $.fn.ColorPickerSliders.getEventCoordinates(ev);

        var xsize = containerElement.width(),
                offsetX = c.pageX - containerElement.offset().left;

        var percent = offsetX / xsize * 100;

        if (percent < 0) {
            percent = 0;
        }

        if (percent > 100) {
            percent = 100;
        }

        return percent;
    };

    $.fn.ColorPickerSliders.getScaledGradientStops = function(color, scalableproperty, minvalue, maxvalue, steps, invalidcolorsopacity, minposition, maxposition) {
        if (typeof invalidcolorsopacity === "undefined") {
            invalidcolorsopacity = 1;
        }

        if (typeof minposition === "undefined") {
            minposition = 0;
        }

        if (typeof maxposition === "undefined") {
            maxposition = 100;
        }

        var gradientStops = [],
                diff = maxvalue - minvalue,
                isok = true;

        for (var i = 0; i < steps; ++i) {
            var currentstage = i / (steps - 1),
                    modifiedcolor = $.fn.ColorPickerSliders.modifyColor(color, scalableproperty, currentstage * diff + minvalue),
                    csscolor;

            if (invalidcolorsopacity < 1) {
                var stagergb = $.fn.ColorPickerSliders.lch2rgb(modifiedcolor, invalidcolorsopacity);

                isok = stagergb.isok;
                csscolor = $.fn.ColorPickerSliders.csscolor(stagergb, invalidcolorsopacity);
            }
            else {
                csscolor = $.fn.ColorPickerSliders.csscolor(modifiedcolor, invalidcolorsopacity);
            }

            gradientStops[i] = {
                color: tinycolor(csscolor).toRgbString(),
                position: Math.round((currentstage * (maxposition - minposition) + minposition) * 100) / 100,
                isok: isok,
                rawcolor: modifiedcolor
            };
        }

        return gradientStops;
    };

    $.fn.ColorPickerSliders.getGradientStopsCSSString = function(gradientstops) {
        var gradientstring = "",
            oldwebkit = "",
            svgstoppoints = "";

        for (var i = 0; i < gradientstops.length; i++) {
            var el = gradientstops[i];

            gradientstring += "," + el.color + " " + el.position + "%";
            oldwebkit += ",color-stop(" + el.position + "%," + el.color + ")";

            var svgcolor = tinycolor(el.color);

            svgstoppoints += '<stop ' + 'stop-color="' + svgcolor.toHexString() + '" stop-opacity="' + svgcolor.toRgb().a + '"' + ' offset="' + el.position/100 + '"/>';
        }

        return {
            noprefix: gradientstring,
            oldwebkit: oldwebkit,
            svg: svgstoppoints
        };
    };

    $.fn.ColorPickerSliders.renderNoprefix = function(element, gradientstops) {
        var css = "linear-gradient(to right",
            stoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).noprefix;

        css += stoppoints + ")";

        element.css("background-image", css);
    };

    $.fn.ColorPickerSliders.renderWebkit = function(element, gradientstops) {
        var css = "-webkit-linear-gradient(left",
            stoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).noprefix;

        css += stoppoints + ")";

        element.css("background-image", css);
    };

    $.fn.ColorPickerSliders.renderOldwebkit = function(element, gradientstops) {
        var css = "-webkit-gradient(linear, 0% 0%, 100% 0%",
            stoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).oldwebkit;

        css += stoppoints + ")";

        element.css("background-image", css);
    };

    $.fn.ColorPickerSliders.renderMs = function(element, gradientstops) {
        var css = "-ms-linear-gradient(to right",
            stoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).noprefix;

        css += stoppoints + ")";

        element.css("background-image", css);
    };

    $.fn.ColorPickerSliders.renderSVG = function(element, gradientstops) {
        var svg = "",
            svgstoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).svg;

        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none"><linearGradient id="vsgg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">';
        svg += svgstoppoints;
        svg += '</linearGradient><rect x="0" y="0" width="1" height="1" fill="url(#vsgg)" /></svg>';
        svg = "url(data:image/svg+xml;base64," + $.fn.ColorPickerSliders.base64encode(svg) + ")";

        element.css("background-image", svg);
    };

    /* source: http://phpjs.org/functions/base64_encode/ */
    $.fn.ColorPickerSliders.base64encode = function(data) {
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            enc = "",
            tmp_arr = [];

        if (!data) {
            return data;
        }

        do {
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);

            bits = o1 << 16 | o2 << 8 | o3;

            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;

            tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        } while (i < data.length);

        enc = tmp_arr.join('');

        var r = data.length % 3;

        return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
    };

    $.fn.ColorPickerSliders.isGoodRgb = function(rgb) {
        // the default acceptable values are out of 0..255 due to
        // rounding errors with yellow and blue colors (258, -1)
        var maxacceptable = 258;
        var minacceptable = -1;

        if (rgb.r > maxacceptable || rgb.g > maxacceptable || rgb.b > maxacceptable || rgb.r < minacceptable || rgb.g < minacceptable || rgb.b < minacceptable) {
            return false;
        }
        else {
            rgb.r = Math.min(255, rgb.r);
            rgb.g = Math.min(255, rgb.g);
            rgb.b = Math.min(255, rgb.b);
            rgb.r = Math.max(0, rgb.r);
            rgb.g = Math.max(0, rgb.g);
            rgb.b = Math.max(0, rgb.b);

            return true;
        }
    };

    $.fn.ColorPickerSliders.rgb2lch = function(rgb) {
        var lch = $.fn.ColorPickerSliders.CIELab2CIELCH($.fn.ColorPickerSliders.XYZ2CIELab($.fn.ColorPickerSliders.rgb2XYZ(rgb)));

        if (rgb.hasOwnProperty('a')) {
            lch.a = rgb.a;
        }

        return lch;
    };

    $.fn.ColorPickerSliders.lch2rgb = function(lch, invalidcolorsopacity) {
        if (typeof invalidcolorsopacity === "undefined") {
            invalidcolorsopacity = 1;
        }

        var rgb = $.fn.ColorPickerSliders.XYZ2rgb($.fn.ColorPickerSliders.CIELab2XYZ($.fn.ColorPickerSliders.CIELCH2CIELab(lch)));

        if ($.fn.ColorPickerSliders.isGoodRgb(rgb)) {
            if (lch.hasOwnProperty('a')) {
                rgb.a = lch.a;
            }

            rgb.isok = true;

            return rgb;
        }

        var tmp = $.extend({}, lch),
                lastbadchroma = tmp.c,
                lastgoodchroma = -1,
                loops = 0;

        do {
            ++loops;

            tmp.c = lastgoodchroma + ((lastbadchroma - lastgoodchroma) / 2);

            rgb = $.fn.ColorPickerSliders.XYZ2rgb($.fn.ColorPickerSliders.CIELab2XYZ($.fn.ColorPickerSliders.CIELCH2CIELab(tmp)));

            if ($.fn.ColorPickerSliders.isGoodRgb(rgb)) {
                lastgoodchroma = tmp.c;
            }
            else {
                lastbadchroma = tmp.c;
            }
        } while (Math.abs(lastbadchroma - lastgoodchroma) > 0.9 && loops < 100);

        if (lch.hasOwnProperty('a')) {
            rgb.a = lch.a;
        }

        rgb.r = Math.max(0, rgb.r);
        rgb.g = Math.max(0, rgb.g);
        rgb.b = Math.max(0, rgb.b);

        rgb.r = Math.min(255, rgb.r);
        rgb.g = Math.min(255, rgb.g);
        rgb.b = Math.min(255, rgb.b);

        if (invalidcolorsopacity < 1) {
            if (rgb.hasOwnProperty('a')) {
                rgb.a = rgb.a * invalidcolorsopacity;
            }
            else {
                rgb.a = invalidcolorsopacity;
            }
        }

        rgb.isok = false;

        return rgb;
    };

    $.fn.ColorPickerSliders.modifyColor = function(color, property, value) {
        var modifiedcolor = $.extend({}, color);

        if (!color.hasOwnProperty(property)) {
            throw("Missing color property: " + property);
        }

        modifiedcolor[property] = value;

        return modifiedcolor;
    };

    $.fn.ColorPickerSliders.csscolor = function(color, invalidcolorsopacity) {
        if (typeof invalidcolorsopacity === "undefined") {
            invalidcolorsopacity = 1;
        }

        var $return = false,
                tmpcolor = $.extend({}, color);

        if (tmpcolor.hasOwnProperty('c')) {
            // CIE-LCh
            tmpcolor = $.fn.ColorPickerSliders.lch2rgb(tmpcolor, invalidcolorsopacity);
        }

        if (tmpcolor.hasOwnProperty('h')) {
            // HSL
            $return = "hsla(" + tmpcolor.h + "," + tmpcolor.s * 100 + "%," + tmpcolor.l * 100 + "%," + tmpcolor.a + ")";
        }

        if (tmpcolor.hasOwnProperty('r')) {
            // RGB
            if (tmpcolor.a < 1) {
                $return = "rgba(" + Math.round(tmpcolor.r) + "," + Math.round(tmpcolor.g) + "," + Math.round(tmpcolor.b) + "," + tmpcolor.a + ")";
            }
            else {
                $return = "rgb(" + Math.round(tmpcolor.r) + "," + Math.round(tmpcolor.g) + "," + Math.round(tmpcolor.b) + ")";
            }
        }

        return $return;
    };

    $.fn.ColorPickerSliders.rgb2XYZ = function(rgb) {
        var XYZ = {};

        var r = (rgb.r / 255);
        var g = (rgb.g / 255);
        var b = (rgb.b / 255);

        if (r > 0.04045) {
            r = Math.pow(((r + 0.055) / 1.055), 2.4);
        }
        else {
            r = r / 12.92;
        }

        if (g > 0.04045) {
            g = Math.pow(((g + 0.055) / 1.055), 2.4);
        }
        else {
            g = g / 12.92;
        }

        if (b > 0.04045) {
            b = Math.pow(((b + 0.055) / 1.055), 2.4);
        }
        else {
            b = b / 12.92;
        }

        r = r * 100;
        g = g * 100;
        b = b * 100;

        // Observer = 2°, Illuminant = D65
        XYZ.x = r * 0.4124 + g * 0.3576 + b * 0.1805;
        XYZ.y = r * 0.2126 + g * 0.7152 + b * 0.0722;
        XYZ.z = r * 0.0193 + g * 0.1192 + b * 0.9505;

        return XYZ;
    };

    $.fn.ColorPickerSliders.XYZ2CIELab = function(XYZ) {
        var CIELab = {};

        // Observer = 2°, Illuminant = D65
        var X = XYZ.x / 95.047;
        var Y = XYZ.y / 100.000;
        var Z = XYZ.z / 108.883;

        if (X > 0.008856) {
            X = Math.pow(X, 0.333333333);
        }
        else {
            X = 7.787 * X + 0.137931034;
        }

        if (Y > 0.008856) {
            Y = Math.pow(Y, 0.333333333);
        }
        else {
            Y = 7.787 * Y + 0.137931034;
        }

        if (Z > 0.008856) {
            Z = Math.pow(Z, 0.333333333);
        }
        else {
            Z = 7.787 * Z + 0.137931034;
        }

        CIELab.l = (116 * Y) - 16;
        CIELab.a = 500 * (X - Y);
        CIELab.b = 200 * (Y - Z);

        return CIELab;
    };

    $.fn.ColorPickerSliders.CIELab2CIELCH = function(CIELab) {
        var CIELCH = {};

        CIELCH.l = CIELab.l;
        CIELCH.c = Math.sqrt(Math.pow(CIELab.a, 2) + Math.pow(CIELab.b, 2));

        CIELCH.h = Math.atan2(CIELab.b, CIELab.a);  //Quadrant by signs

        if (CIELCH.h > 0) {
            CIELCH.h = (CIELCH.h / Math.PI) * 180;
        }
        else {
            CIELCH.h = 360 - (Math.abs(CIELCH.h) / Math.PI) * 180;
        }

        return CIELCH;
    };

    $.fn.ColorPickerSliders.CIELCH2CIELab = function(CIELCH) {
        var CIELab = {};

        CIELab.l = CIELCH.l;
        CIELab.a = Math.cos(CIELCH.h * 0.01745329251) * CIELCH.c;
        CIELab.b = Math.sin(CIELCH.h * 0.01745329251) * CIELCH.c;

        return CIELab;
    };

    $.fn.ColorPickerSliders.CIELab2XYZ = function(CIELab) {
        var XYZ = {};

        XYZ.y = (CIELab.l + 16) / 116;
        XYZ.x = CIELab.a / 500 + XYZ.y;
        XYZ.z = XYZ.y - CIELab.b / 200;

        if (Math.pow(XYZ.y, 3) > 0.008856) {
            XYZ.y = Math.pow(XYZ.y, 3);
        }
        else {
            XYZ.y = (XYZ.y - 0.137931034) / 7.787;
        }

        if (Math.pow(XYZ.x, 3) > 0.008856) {
            XYZ.x = Math.pow(XYZ.x, 3);
        }
        else {
            XYZ.x = (XYZ.x - 0.137931034) / 7.787;
        }

        if (Math.pow(XYZ.z, 3) > 0.008856) {
            XYZ.z = Math.pow(XYZ.z, 3);
        }
        else {
            XYZ.z = (XYZ.z - 0.137931034) / 7.787;
        }

        // Observer = 2°, Illuminant = D65
        XYZ.x = 95.047 * XYZ.x;
        XYZ.y = 100.000 * XYZ.y;
        XYZ.z = 108.883 * XYZ.z;

        return XYZ;
    };

    $.fn.ColorPickerSliders.XYZ2rgb = function(XYZ) {
        var rgb = {};

        // Observer = 2°, Illuminant = D65
        XYZ.x = XYZ.x / 100;        // X from 0 to 95.047
        XYZ.y = XYZ.y / 100;        // Y from 0 to 100.000
        XYZ.z = XYZ.z / 100;        // Z from 0 to 108.883

        rgb.r = XYZ.x * 3.2406 + XYZ.y * -1.5372 + XYZ.z * -0.4986;
        rgb.g = XYZ.x * -0.9689 + XYZ.y * 1.8758 + XYZ.z * 0.0415;
        rgb.b = XYZ.x * 0.0557 + XYZ.y * -0.2040 + XYZ.z * 1.0570;

        if (rgb.r > 0.0031308) {
            rgb.r = 1.055 * (Math.pow(rgb.r, 0.41666667)) - 0.055;
        }
        else {
            rgb.r = 12.92 * rgb.r;
        }

        if (rgb.g > 0.0031308) {
            rgb.g = 1.055 * (Math.pow(rgb.g, 0.41666667)) - 0.055;
        }
        else {
            rgb.g = 12.92 * rgb.g;
        }

        if (rgb.b > 0.0031308) {
            rgb.b = 1.055 * (Math.pow(rgb.b, 0.41666667)) - 0.055;
        }
        else {
            rgb.b = 12.92 * rgb.b;
        }

        rgb.r = Math.round(rgb.r * 255);
        rgb.g = Math.round(rgb.g * 255);
        rgb.b = Math.round(rgb.b * 255);

        return rgb;
    };

    $.fn.ColorPickerSliders.detectWhichGradientIsSupported = function() {
        var testelement = document.createElement('detectGradientSupport').style;

        try {
            testelement.backgroundImage = "linear-gradient(to top left, #9f9, white)";
            if (testelement.backgroundImage.indexOf("gradient") !== -1) {
                return "noprefix";
            }

            testelement.backgroundImage = "-webkit-linear-gradient(left top, #9f9, white)";
            if (testelement.backgroundImage.indexOf("gradient") !== -1) {
                return "webkit";
            }

            testelement.backgroundImage = "-ms-linear-gradient(left top, #9f9, white)";
            if (testelement.backgroundImage.indexOf("gradient") !== -1) {
                return "ms";
            }

            testelement.backgroundImage = "-webkit-gradient(linear, left top, right bottom, from(#9f9), to(white))";
            if (testelement.backgroundImage.indexOf("gradient") !== -1) {
                return "oldwebkit";
            }
        }
        catch(err) {
            try {
                testelement.filter = "progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffff',endColorstr='#000000',GradientType=0)";
                if (testelement.filter.indexOf("DXImageTransform") !== -1) {
                    return "filter";
                }
            }
            catch(err) {}
        }

        return false;
    };

    $.fn.ColorPickerSliders.svgSupported = function() {
        return !! document.createElementNS && !! document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect;
    };

})(jQuery);

