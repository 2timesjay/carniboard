// /* Imports */

Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

console.log("Starting");

makeTicTacToe = require('../model/construction').makeTicTacToe;
makeConnectFour = require('../model/construction').makeConnectFour;
makeBasicTactics = require('../model/construction').makeBasicTactics;
makeCheckers = require('../model/construction').makeCheckers;
draw = require('../view/drawthree');
redraw = draw.redraw;
addListeners = draw.addListeners;
checkConfirmation = draw.checkConfirmation;

timeline = require("../view/timelinethree");
makeTimeline = timeline.makeTimeline;
createTimelineController = timeline.createTimelineController;

wiring = require("../utilities/wiring.js")
ListView = wiring.ListView;

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

draw.glinit(canvas);
draw.glanimate();

canvas.addEventListener(
    'mousemove', 
    () => loop()
);
canvas.addEventListener(
    'click',
    () => loop()
);
