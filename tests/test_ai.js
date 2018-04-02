var test = require('tape');

makeBasicTactics = require('../model/construction').makeBasicTactics;
makeTicTacToe = require('../model/construction').makeTicTacToe;
generateAllSelections = require('../model/ai').generateAllSelections;

/* Basic Tactics specific setup */
const k = 8;
const size = 100;

test('testTicTacToeScore', function (t) {
    t.plan(5);
    let state = makeTicTacToe();
    let stack = state.stack;
    let locations = state.space.locations;

    options = generateAllSelections(state);
    sel = stack.concat([locations[0][0]]);
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    t.equals(state.score, 0);

    options = generateAllSelections(state);
    sel = stack.concat([locations[1][0]]);
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    t.equals(state.score, 0);

    options = generateAllSelections(state);
    sel = stack.concat([locations[0][1]]);
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    t.equals(state.score, 0);

    options = generateAllSelections(state);
    sel = stack.concat([locations[1][1]]);
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    t.equals(state.score, 0);

    options = generateAllSelections(state);
    sel = stack.concat([locations[0][2]]);
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    t.equals(state.score, -1);

});