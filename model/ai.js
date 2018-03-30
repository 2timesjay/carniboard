Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

generateAllSelections = function (state) {
    let stack = state.stack;
    let space = state.space;
    // let digestFnGetter = state.digestFnGetter;
    // let digestFn = digestFnGetter(stack);
    // let effects = digestFn(stack)
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