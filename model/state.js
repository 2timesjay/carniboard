class State {
    constructor(space, stack, gameEndFn, digestFnGetter) {
        this.space = space;
        this.stack = stack;
        this.gameEndFn = gameEndFn;
        this.digestFnGetter = digestFnGetter;
        this.observers = [];
        this.team = 0;
        this.inputStack = [];
    }
}

module.exports = {
    State: State
}