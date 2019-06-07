var test = require('tape');

makeBasicTactics = require('../../model/construction').makeBasicTactics;
makeTicTacToe = require('../../model/construction').makeTicTacToe;
ai = require('../../model/ai');
generateAllSelections = ai.generateAllSelections;

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

test('testRollout', function (t) {
    t.plan(10);
    for (let i = 0; i < 10; i++) {
        let state = makeTicTacToe();
        let stack = state.stack;
        let locations = state.space.locations;
        rollout_state = ai.rollout(state);
        t.ok(rollout_state.space.units.length >= 5,
            "Expected more than 5 units, got : " + rollout_state.space.units.length + "\r\n" + rollout_state.space.units.map(u => "(" + u.loc.x + ", " + u.loc.y + ")"))
    }
});