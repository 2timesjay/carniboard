/* Imports */
utils = require('../utilities/utilities.js');
Array.prototype.flatMap = utils.flatMap;

console.log("Starting");

makeTicTacToe = require('../model/construction').makeTicTacToe;
makeConnectFour = require('../model/construction').makeConnectFour;
makeBasicTactics = require('../model/construction').makeBasicTactics;
draw = require('../view/draw');
redraw = draw.redraw;
addListeners = draw.addListeners;
checkConfirmation = draw.checkConfirmation;

timeline = require("../view/timeline");
makeTimeline = timeline.makeTimeline;
createTimelineController = timeline.createTimelineController;

wiring = require("../utilities/wiring.js")
ListView = wiring.ListView;

/* Checkers specific setup */
const k = 4;
const size = 100;
const buildState = makeCheckers;

/* Tic Tac Toe specific setup */
// const k = 3;
// const size = 100;
// const buildState = makeTicTacToe;

/* Connect Four specific setup */
// const k = 7;
// const size = 100;
// const buildState = makeConnectFour;

// /* Basic Tactics specific setup */
// const k = 8;
// const size = 100;
// const buildState = makeBasicTactics;

/* Generic setup */
const canvas = draw.makeCanvas(k * 100, k * size, true);
const context = canvas.getContext("2d");
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
loop();

canvas.addEventListener(
    'mousemove', 
    () => loop()
);
canvas.addEventListener(
    'click',
    () => loop()
);

setInterval(loop, 10);