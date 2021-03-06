utils = require('../utilities/utilities.js');
Array.prototype.flatMap = utils.flatMap;

score = function(state) {  // (state: State): number 
    return state.score;
}

random_policy = function(selections) {  // (selections: selection[]): number[]
    if (selections.length == 0) { return []; }
    let uniform_random = new Array(selections.length);
    uniform_random.fill(1.0/selections.length);
    return uniform_random;
}

improved_policy = function (selections, state, Q, N) {  // (selections: selection[]): number[]
    if (selections.length == 0) { return []; }
    let uniform_random = new Array(selections.length);
    uniform_random.fill(1.0 / selections.length);
    return uniform_random;
}

selectFromDistribution = function(distribution) {
    rand = Math.random();
    current = 0;
    for(var i = 0; i < distribution.length; i++) {
        current += distribution[i];
        if (current > rand) {
            return i;
        }
    }
    return i;
}

rollout = function(state) {
    let max_turns = 50;
    let cur_turn = 0;
    let rollout_state = state.clone();
    while (cur_turn < max_turns && !rollout_state.isOver() ) {
        cur_turn++;
        let selections = generateAllSelections(rollout_state);
        let pol = random_policy(selections);
        let selection = selections[selectFromDistribution(pol)];
        rollout_state = executeStacks(rollout_state, [selection])
    }
    return rollout_state;
}

executeStacks = function(state, stacks) {
    // TODO: Cloning relies on effect implementation matching distinct objects
    let space = state.space;
    let digestFnGetter = state.digestFnGetter;
    for (stack of stacks) {
        let digestFn = digestFnGetter(stack);
        let effects = digestFn(stack);
        effects.map(e => e.execute(space));
    }
    return state;
}

generateAllSelections = function (state) {
    let stack = state.stack;
    let space = state.space;
    return generateAllSelectionsHelper(stack, space);
}

generateAllSelectionsHelper = function(stack, space) {
    nextSelection = stack[stack.length - 1].getNextSelection(space);
    if (nextSelection.length == 1 && nextSelection[0].constructor.name == "Confirmation") {
        return [stack];
    }
    else {
        return nextSelection.flatMap(sel => generateAllSelectionsHelper(stack.concat([sel]), space));
    }
}

module.exports = {
    generateAllSelections: generateAllSelections,
    rollout: rollout,
}