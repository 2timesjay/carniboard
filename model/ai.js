Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

score = function(state) {  // (state: State): number 
    return state.score;
}

policy = function(selections) {  // (selections: selection[]): number[]
    if (selections.length == 0) { return []; }
    let random_policy = new Array(selections.length);
    random_policy.fill(1.0/selections.length);
    return random_policy;
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
    let rollout_state = state;
    while (cur_turn < max_turns && !rollout_state.isOver() ) {
        cur_turn++;
        console.log(cur_turn);
        let selections = generateAllSelections(state);
        let pol = policy(selections);
        let selection = selections[selectFromDistribution(pol)];
        console.log(selection);
        rollout_state = executeStacks(state, [selection])
    }
    return rollout_state;
}

executeStacks = function(state, stacks) {
    // TODO: Buggy due to cloning state but not cloning stack.
    let clone = state.clone();
    let space = clone.space;
    let digestFnGetter = clone.digestFnGetter;
    for (stack of stacks) {
        let digestFn = digestFnGetter(stack);
        let effects = digestFn(stack);
        effects.map(e => e.execute(space));
    }
    return clone;
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