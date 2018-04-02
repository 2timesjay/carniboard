class State {
    constructor(space, stack, gameEndFn, digestFnGetter, scoreFn) {
        this.space = space;
        this.stack = stack;
        this.space.state = this;
        this.gameEndFn = gameEndFn;
        this.digestFnGetter = digestFnGetter;
        this.scoreFn = scoreFn;
        this.observers = [];
        this.team = 0;
    }

    get score() { // (): number
        /**
         * Score from current team's perspective.
         */
        return this.scoreFn(this);
    }

    triggerObservers(effect) { // (effect: Effect) => Effect[]
        let triggeredEffects = this.observers.flatMap(o => o.trigger(effect));
        this.observers = this.observers.filter(o => o.active);
        return triggeredEffects;
    }

    advance() {
        this.team = 1 - this.team;
    }

    clone() {
        let clonedSpace = this.space.clone();
        if (stack.length > 1) {
            return "FAILED";
        }
        let clonedStack = stack.map(e => e.clone());
        return new State(clonedSpace, clonedStack, this.gameEndFn, this.digestFnGetter);
    }
}

module.exports = {
    State: State
}