Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

explore = function(state, stackSequence) {
    let clone = state.clone();
    let space = clone.space;
    let digestFnGetter = clone.digestFnGetter;
    for (stack of stackSequence) {
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
}