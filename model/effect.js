observer = require("../model/observer");
CounterObserver = observer.CounterObserver;

class Effect {
    constructor() {
    }

    preExecute() { }

    execute() { }


    animationDuration(){
        return 0;
    }

    postExecute() { }
}

class AddUnitEffect extends Effect {
    constructor(destination) {
        super();
        this.destination = destination;
    }

    execute(sp) {
        sp.units.push(new Unit("", sp.getLocation(this.destination), sp.state.team));
        return this;
    }
}

class EndTurnEffect extends Effect {
    constructor() {
        super();
    }

    execute(sp) {
        sp.state.advance();
        return this;
    }
}

class MoveEffect extends Effect {
    constructor(unit, destination) {
        super();
        this.unit = unit;
        this.destination = destination;
    }

    execute(sp) {
        this.unit = sp.units.filter(u => u.name == this.unit.name)[0]; // Questionable way to update unit on refresh.
        this.unit.loc = sp.getLocation(this.destination);
        return this;
    }

    animationDuration() {
        return 500* (Math.abs(this.unit.loc.x - this.destination.x) + Math.abs(this.unit.loc.y - this.destination.y));
    }
}

class DamageEffect extends Effect {
    constructor(unit, target) {
        super();
        this.unit = unit;
        this.target = target;
    }

    preExecute(sp) { // (sp: Space) : Effect
        let effects = sp.state.triggerObservers(this);
        console.log("triggered effects: ", effects);
        return effects.map(e => e.execute(sp));
    }

    execute(sp) {
        this.unit = sp.units.filter(u => u.name == this.unit.name)[0];
        this.preExecute(sp);
        const unitsAtTarget = sp.getUnit(this.target);
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

    execute(sp) {
        sp.state.observers.push(new CounterObserver(this.unit));
        return this;
    }
}

module.exports = {
    AddUnitEffect: AddUnitEffect,
    EndTurnEffect: EndTurnEffect,
    MoveEffect: MoveEffect,
    DamageEffect: DamageEffect,
    SetObserverEffect: SetObserverEffect
}