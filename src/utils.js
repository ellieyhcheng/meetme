function hex(n) {
    n = n.toString(16);

    if (n.length === 1) {
        n = '0' + n;
    }

    return n;
}

function RBGtoHex(rgb) {
    return '#' + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

function hexToRGB(hex) {
    var color = [];
    hex = hex[0] === '#' ? hex.substring(1) : hex;
    color[0] = parseInt((hex).substring(0, 2), 16);
    color[1] = parseInt((hex).substring(2, 4), 16);
    color[2] = parseInt((hex).substring(4, 6), 16);
    return color;
}

function colorGradient(colorStart, colorEnd, colorCount) {
    var start = hexToRGB(colorStart);
    var end = hexToRGB(colorEnd);
    var blend = 0.0;
    var gradient = [];

    for (let i = 0; i < colorCount; i++) {
        var c = [];

        c[0] = Math.round(start[0] * blend + (1 - blend) * end[0]);
        c[1] = Math.round(start[1] * blend + (1 - blend) * end[1]);
        c[2] = Math.round(start[2] * blend + (1 - blend) * end[2]);
        blend += (1 / (colorCount - 1));


        gradient.push(RBGtoHex(c));
    }

    return gradient;
}

export {colorGradient}