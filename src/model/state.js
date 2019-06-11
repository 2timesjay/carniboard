SelectionStack = require('../controller/selection_stack').SelectionStack;

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

    isOver() { // (): number
        /**
         * Score from current team's perspective.
         */
        return this.gameEndFn(this.space).length > 0;
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
    // TODO: Cloning relies on effect implementation matching distinct objects
        let clonedSpace = this.space.clone();
        let clonedStack = [stack[0].clone()];
        return new this.constructor(clonedSpace, clonedStack, this.gameEndFn, this.digestFnGetter, this.scoreFn);
    }
}

class GameState {
    constructor(space, units, gameEndFn, digestFnGetter, scoreFn) {
        this.space = space;
        this.units = units;
        this.gameEndFn = gameEndFn;
        this.digestFnGetter = digestFnGetter;
        this.scoreFn = scoreFn;
        this.observers = [];
        this.team = 0;
    }

    initializeStack(initial_entity_list) {
        // Returns a stack which includes this State.
        let stack = new SelectionStack(initial_entity_list, this);
        return stack;
    }

    get score() { // (): number
        /**
         * Score from current team's perspective.
         */
        return this.scoreFn(this);
    }

    isOver() { // (): number
        /**
         * Score from current team's perspective.
         */
        return this.gameEndFn(this).length > 0;
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
        // TODO: NOT IMPLEMENTED;
        return null;
    }
}

module.exports = {
    State: State,
    GameState: GameState
}