class CounterObserver {
    constructor(unit) {
        this.unit = unit;
        this.active = true;
    }

    trigger(effect) {
        // Counter attacks targeted at this unit.
        if (effect.constructor.name == "DamageEffect" &&
            effect.target.x == this.unit.loc.x &&
            effect.target.y == this.unit.loc.y &&
            this.unit.hp > 0) {
            console.log("COUNTER TRIGGERED");
            this.active = false;
            return [new DamageEffect(this.unit, effect.unit.loc)];
        } else {
            return [];
        }
    }
}

module.exports = {
    CounterObserver: CounterObserver
}