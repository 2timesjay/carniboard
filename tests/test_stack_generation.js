var test = require('tape');

makeBasicTactics = require('../model/construction').makeBasicTactics;
makeTicTacToe = require('../model/construction').makeTicTacToe;
generateAllSelections = require('../model/ai').generateAllSelections;

/* Basic Tactics specific setup */
const k = 8;
const size = 100;

test('simulatedBasicTacticsSelectionIntegration', function (t) {
    let state = makeBasicTactics();
    let space = state.space;
    let stack = state.stack;
    let digestFnGetter = state.digestFnGetter;

    t.plan(5);

    let topSel = stack[stack.length - 1].getNext(space);
    t.deepEquals(
        topSel
        [space.units.filter(u => u.team == 0)]
    );
    
    stack.push(topSel[0]);
    topSel = stack[stack.length - 1].getNext(space);
    t.deepEquals(
        topSel.map(a => a.actionType),
        ['MOVE', 'ATTACK', 'COUNTER'],
        "Unit selection gives action enum options"
    );

    stack.push(topSel[0]);
    topSel = stack[stack.length - 1].getNext(space);
    t.deepEquals(
        topSel.length,
        5,
        "Selecting move gives Path options"
    );

    stack.push(topSel[4]);
    console.log(stack[stack.length-1]);
    topSel = stack[stack.length - 1].getNext(space);
    t.deepEquals(
        topSel[0].constructor.name,
        "Confirmation",
        "Last option is confirmation"
    );

    let digestFn = digestFnGetter(stack);
    let effects = digestFn(stack);
    t.deepEquals(
        effects.length,
        2,
        "Generate 2 effects"
    );
});

test('generateAllSelectionsBasicTactics', function (t) {
    t.plan(1);
    let state = makeBasicTactics();
    let options = generateAllSelections(state);
    t.equals(options.length, 67);
});

test('generateAllSelectionsTicTacToe', function (t) {
    t.plan(8);
    let state = makeTicTacToe();

    let options = generateAllSelections(state);
    t.equals(options.length, 9);

    sel = options[0];
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    options = generateAllSelections(state);
    t.equals(options.length, 8);

    sel = options[0];
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    options = generateAllSelections(state);
    t.equals(options.length, 7);

    sel = options[0];
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    options = generateAllSelections(state);
    t.equals(options.length, 6);

    sel = options[0];
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    options = generateAllSelections(state);
    t.equals(options.length, 5);

    sel = options[0];
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    options = generateAllSelections(state);
    t.equals(options.length, 4);

    sel = options[0];
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    options = generateAllSelections(state);
    t.equals(options.length, 3);

    sel = options[0];
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    options = generateAllSelections(state);
    t.equals(options.length, 1); // GAME OVER
});

test('generateAllSelectionsFromClone', function (t) {
    t.plan(4);
    let state = makeTicTacToe();
    let clone = state.clone();

    let options = generateAllSelections(state);
    t.equals(options.length, 9);
    
    sel = options[0];
    effects = state.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(state.space));
    options = generateAllSelections(state);
    t.equals(options.length, 8);

    options = generateAllSelections(clone);
    t.equals(options.length, 9);

    sel = options[0];
    effects = clone.digestFnGetter(sel)(sel);
    effects.forEach(e => e.execute(clone.space));
    options = generateAllSelections(clone);
    t.equals(options.length, 8);
});