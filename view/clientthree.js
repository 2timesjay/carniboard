// /* Imports */

Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

console.log("Starting");

makeTicTacToe = require('../model/construction').makeTicTacToe;
makeConnectFour = require('../model/construction').makeConnectFour;
makeBasicTactics = require('../model/construction').makeBasicTactics;
draw = require('../view/drawthree');
redraw = draw.redraw;
addListeners = draw.addListeners;

timeline = require("../view/timelinethree");
makeTimeline = timeline.makeTimeline;
createTimelineController = timeline.createTimelineController;

wiring = require("../utilities/wiring.js")
ListView = wiring.ListView;


// Very detacted from draw/display. Fits Controller.
var checkConfirmation = function (state, timelineView) {
    let space = state.space
    let stack = state.stack;
    let digestFnGetter = state.digestFnGetter;
    let topSel = stack[stack.length - 1].getNextSelection(space);
    if (topSel.length > 0 && topSel[0].constructor.name == "Confirmation" && !topSel[0].isEnd) {
        console.log("CONFIRMED: ", stack);
        let digestFn = digestFnGetter(stack);
        let effects = digestFn(stack);
        while (stack.length > 1) {
            let top = stack[stack.length - 1];
            top.display._deselect(stack);
        }
        executed_effects = execute(effects, space);
        // TODO: Ensure counters pushed to timeline properly
        console.log("Post Execution: ", state);
        if (timelineView != undefined) {
            timelineView.push(executed_effects); // INTERFACE
            console.log("Timeline: ", timelineView);
        }
        return true;
    }
    return false;
}

// Very detacted from draw/display. Fits Controller.
var execute = function (effects, space) {  // Clarify as "requestExecution"
    var effectToPromise = function (effect) { // TODO: This is incomprehensible
        return () => {
            let effectPromise = new Promise((resolve, reject) => {
                let duration = effect.animationDuration();
                let result = effect.execute(space);
                let executeAndAnimate = setTimeout(() => {
                    clearTimeout(executeAndAnimate);
                    resolve(result);
                    console.log("PROMISED: ", duration, effect);
                }, duration)
            })
            return effectPromise;
        }
    }

    var executionPromise = effects.reduce((prev, cur) => prev.then(effectToPromise(cur)), Promise.resolve());
    //executionPromise.then();
    return effects;
}

// /* Tic Tac Toe specific setup */
// const k = 3;
// const size = 100;
// const buildState = makeTicTacToe;

// /* Connect Four specific setup */
// // const k = 7;
// // const size = 100;
// // const buildState = makeConnectFour;

// /* Basic Tactics specific setup */
const k = 8;
const size = 100;
const buildState = makeBasicTactics;

/* Generic setup */
const canvas = draw.makeCanvas(k * 100, k * size, true);
const context = canvas.getContext("webgl", {preserveDrawingBuffer: true});
var state = buildState();
var triggerList = [];

var tl = new ListView([]);
var tlc = createTimelineController(
    tl, 
    ()=> { 
        state = buildState();
        console.log("REAPPLY TIMELINE");
        tl.value.flatMap(e => e).map(e => e.execute(state.space));
    }
);
var tl_images = [];
var tl_canvas = draw.makeCanvas(k*size/2, k*size/2, true);
var tl_render_fn = () => makeTimeline(context, tl, tl_images, tl_canvas);

var loop = function() {
    redraw(context, state, triggerList, size);
    addListeners(context, triggerList);
    checkConfirmation(state, tl); // TODO: Timeline
    tl_render_fn();
}

draw.init(canvas);
draw.animate();

canvas.addEventListener(
    'mousemove', 
    () => loop()
);
canvas.addEventListener(
    'click',
    () => loop()
);
