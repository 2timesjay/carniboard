class Effect {
    constructor() {
    }

    preExecute() { }

    execute() { }

    postExecute() { }
}

class AddUnitEffect extends Effect {
    constructor(destination) {
        super();
        this.destination = destination;
    }

    execute(contextSpace) {
        contextSpace.units.push(new Unit("", contextSpace.getLocation(this.destination), contextSpace.team));
        return this;
    }
}

class EndTurnEffect extends Effect {
    constructor() {
        super();
    }

    execute(contextSpace) {
        contextSpace.advance();
        return this;
    }
}

class MoveEffect extends Effect {
    constructor(unit, destination) {
        super();
        this.unit = unit;
        this.destination = destination;
    }

    execute(contextSpace) {
        this.unit = contextSpace.units.filter(u => u.name == this.unit.name)[0]; // Questionable way to update unit on refresh.
        this.unit.loc = contextSpace.locations[this.destination.y][this.destination.x];
        // this.unit.loc = this.destination;
        return this;
    }
}

class DamageEffect extends Effect {
    constructor(unit, target) {
        super();
        this.unit = unit;
        this.target = target;
    }

    preExecute(contextSpace) { // (contextSpace: Space) : Effect
        let effects = contextSpace.triggerObservers(this);
        console.log("triggered effects: ", effects);
        return effects.map(e => e.execute(contextSpace));
    }

    execute(contextSpace) {
        this.unit = contextSpace.units.filter(u => u.name == this.unit.name)[0];
        this.preExecute(contextSpace);
        const unitsAtTarget = contextSpace.getUnit(this.target);
        if (unitsAtTarget.length == 1) {
            const targetUnit = unitsAtTarget[0];
            targetUnit.hp = targetUnit.hp - this.unit.dmg;
            console.log("Attacked ", targetUnit.name, " for ", this.unit.dmg, " damage. Remaining health: ", targetUnit.hp);
        } else {
            console.log("Attack whiffed!");
        }
        return this;
    }
}

class SetObserverEffect extends Effect {
    constructor(stack) {
        super();
        console.log("Set Observer: ", stack);
        this.unit = stack[1];
    }

    execute(contextSpace) {
        contextSpace.observers.push(new CounterObserver(this.unit));
        return this;
    }
}

module.exports = {
    AddUnitEffect: AddUnitEffect,
    EndTurnEffect: EndTurnEffect
}