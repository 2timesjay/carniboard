draw = require('../view/draw');

makeTimeline = function (originalContext, timeline, timelineImages, canvas) {
    // https://stackoverflow.com/questions/3420975/html5-canvas-zooming
    // http://jsfiddle.net/mBzVR/2433/
    canvas.setAttribute("style", "background-color:green")
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
    canvas.setAttribute("width", (tlen + 1) * width * scale);
    const context = canvas.getContext("2d");
    const imageData = originalContext.getImageData(0, 0, width, height);
    if (timelineImages.length <= tlen) {
        timelineImages.push(imageData);
    } else {
        timelineImages[tlen] = imageData;
    }
    //context.canvas.value = context;
    drawContents(context, scale);
    return context.canvas;
}

function createTimelineController(timelineView, resetFn) {
    let lc = new ListController(timelineView); // INTERFACE
    lc.addEventListener("input", () => {
        resetFn();
    });
    document.body.appendChild(lc);
    return lc;
}

class ListView {
    constructor(initial_list) {
        this._listeners = [];
        this._value = initial_list;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.dispatchEvent({ type: "input", value });
    }

    get length() {
        return this._value.length;
    }

    push(elem) {
        this._value.push(elem);
        this.basicDispatch();
    }

    extend(li) {
        this._value = this._value.concat(li);
        this.basicDispatch();
    }

    pop() {
        this._value.pop();
        this.basicDispatch();
    }

    splice(i) {
        this._value.splice(i);
        this.basicDispatch();
    }

    first() {
        return this._value[0];
    }

    last() {
        return this._value[this._value.length - 1];
    }

    basicDispatch() {
        const _value = this._value;
        this.dispatchEvent({ type: "input", _value });
    }

    addEventListener(type, listener) {
        if (type != "input" || this._listeners.includes(listener)) return;
        this._listeners = [listener].concat(this._listeners);
    }

    removeEventListener(type, listener) {
        if (type != "input") return;
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    dispatchEvent(event) {
        const p = Promise.resolve(event);
        this._listeners.forEach(l => p.then(l));
    }

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

class Signal {
    constructor() {
        this._listeners = [];
    }

    trigger() {
        this.dispatchEvent({ type: "input" });
    }
    addEventListener(type, listener) {
        if (type != "input" || this._listeners.includes(listener)) return;
        this._listeners = [listener].concat(this._listeners);
    }
    removeEventListener(type, listener) {
        if (type != "input") return;
        this._listeners = this._listeners.filter(l => l !== listener);
    }
    dispatchEvent(event) {
        const p = Promise.resolve(event);
        this._listeners.forEach(l => p.then(l));
    }
}

module.exports = {
    makeTimeline: makeTimeline,
    createTimelineController: createTimelineController,
    ListView: ListView,
    ListController: ListController
}