makeTicTacToe = require('../model/construction').makeTicTacToe;
draw = require('../view/draw');
redraw = draw.redraw;
addListeners = draw.addListeners;
checkConfirmation = draw.checkConfirmation;

const k = 3;
const size = 100;
const canvas = document.createElement('canvas');
canvas.width = k * 100;
canvas.height = k * size;
const context = canvas.getContext("2d");
document.body.appendChild(canvas);

var state = makeTicTacToe();
var triggerList = [];

var loop = function() {
    redraw(context, state, triggerList, size);
    addListeners(context, triggerList);
    checkConfirmation(state); // TODO: Timeline
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
