draw = require('../view/drawthree');

function createTimelineController(timelineView, resetFn) {
    let lc = new ListController(timelineView); // INTERFACE
    lc.addEventListener("input", () => {
        resetFn();
    });
    document.body.appendChild(lc);
    return lc;
}

module.exports = {
    createTimelineController: createTimelineController
}
makeTimeline = function (originalContext, timeline, timelineImages, timelineCanvas) {
    // https://stackoverflow.com/questions/3420975/html5-canvas-zooming
    // http://jsfiddle.net/mBzVR/2433/
    // canvas.setAttribute("style", "background-color:green")
    const tlen = timeline.length;
    var width = originalContext.canvas.width;
    var height = originalContext.canvas.height;
    var scale = Math.min(0.25, 1.0 / tlen);
    function drawContents(ctx, scale) {
        ctx.scale(scale, scale);
        let temp = timelineImages
            .map((image, i) => {
                const copyContext = draw.makeCanvas(width, height, false).getContext("2d");
                copyContext.putImageData(image, 0, 0);
                return copyContext;
            })
            .map((copied, i) => ctx.drawImage(copied.canvas, width * i, 0));
    }
    timelineCanvas.setAttribute("width", (tlen + 1) * width * scale);
    const context = timelineCanvas.getContext('2d');
    // Copy image from webgl buffer
    var pixels = new Uint8Array(originalContext.drawingBufferWidth * originalContext.drawingBufferHeight * 4);
    console.log(originalContext);
    originalContext.readPixels(
        0, 0, context.drawingBufferWidth, context.drawingBufferHeight, 
        originalContext.RGBA, originalContext.UNSIGNED_BYTE, pixels
    );
    var imageData = new ImageData(pixels, originalContext.drawingBufferWidth, originalContext.drawingBufferHeight);
    // var buffer = new ArrayBuffer(4 * 100 * 100);
    // var ubuf = new Uint8Array(buffer);
    // for (var i = 0; i < ubuf.length; i += 4) {
    //     imgData.data[i] = ubuf[i];   //red
    //     imgData.data[i + 1] = ubuf[i + 1]; //green
    //     imgData.data[i + 2] = ubuf[i + 2]; //blue
    //     imgData.data[i + 3] = ubuf[i + 3]; //alpha
    // }
    // ctx.putImageData(imgData, 0, 0);
    
    if (timelineImages.length <= tlen) {
        timelineImages.push(imageData);
    } else {
        timelineImages[tlen] = imageData;
    }
    //context.canvas.value = context;
    drawContents(context, scale);
    return context.canvas;
}

function ListController(list_view) { // list_view: viewof
    // const input = html`<input type=number start=0 min=0 step=1 style="width:auto;">`;
    const input = document.createElement("input")
    input.setAttribute("type", "number");
    input.setAttribute("start", 0);
    input.setAttribute("min", 0);
    input.setAttribute("step", 1);
    input.setAttribute("style", "width:auto");
    list_view.addEventListener("input", event => input.value = list_view.value.length);
    input.addEventListener("input", () => { }); // prevent re-build, which messes up UI
    input.oninput = () => {
        const newVal = input.valueAsNumber;
        for (let i = list_view.value.length; i > newVal; i--) {
            list_view.pop();
        }
    }
    input.value = list_view.value.length;
    return input;
}

module.exports = {
    makeTimeline: makeTimeline,
    createTimelineController: createTimelineController,
    ListController: ListController
}