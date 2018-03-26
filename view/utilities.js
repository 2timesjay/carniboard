lerp = function*(rate, current, target, minTime) {
    /* linearly interpolate value from a to b over time t */
    let startTime = new Date().getTime();
    let initialTime = startTime;
    while (Math.abs(target - current) > rate / 100) {
        let diff = target - current;
        let curTime = new Date().getTime();
        let deltaTime = curTime - startTime;
        startTime = curTime;
        let delta = Math.min(rate * deltaTime / 1000, Math.abs(diff)) * Math.sign(diff);
        yield current;
        current += delta;
    }
    while (new Date().getTime() - initialTime < minTime) {
        yield target;
    }
}

chain = function*(...generators) {
    for (let g of generators) {
        yield *g;
    }
}

// var makeCanvas = function (width, height, attach) {
//     var canvas = document.createElement("canvas");
//     canvas.setAttribute("width", width);
//     canvas.setAttribute("height", height);
//     if (attach) {
//         document.body.appendChild(canvas);
//     }
//     return canvas;
// }

// var addDisplay = function (entity) {
//     var className = entity.constructor.name;
//     var displayConstructor = display[className];
//     if (displayConstructor == undefined) { return undefined; }
//     else { return new displayConstructor(entity); }
// }

function getMousePos(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
}

function makeRect(x, y, context, size, clr, lfa) {
    const alpha = lfa == undefined ? 1.0 : lfa;
    const color = clr == undefined ? "#000000" : clr;
    context.globalAlpha = alpha;
    context.beginPath();
    context.rect(x, y, size, size);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 4;
    context.strokeStyle = 'black';
    context.stroke();
    context.globalAlpha = 1.0;
}

function makeCircle(x, y, context, size, clr, lfa) {
    const alpha = lfa == undefined ? 1.0 : lfa;
    const color = clr == undefined ? "#000000" : clr;
    var centerX = x;
    var centerY = y;
    var radius = size;

    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 5;
    // context.strokeStyle = color;
    // context.stroke();
    context.globalAlpha = 1.0;
}

module.exports = {
    lerp: lerp,
    getMousePos: getMousePos,
    makeRect: makeRect,
    makeCircle: makeCircle
}