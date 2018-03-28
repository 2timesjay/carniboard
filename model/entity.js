Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

effects = require("../model/effect")
AddUnitEffect = effects.AddUnitEffect
EndTurnEffect = effects.EndTurnEffect
MoveEffect = effects.MoveEffect
DamageEffect = effects.DamageEffect
SetObserverEffect = effects.SetObserverEffect

difference = (set1, set2) => new Set([...set1].filter(num => !set2.has(num)))

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

class AbstractEntity {
    constructor() {
        this.clearNextSelection();
    }

    getNextSelection(contextSpace) { // TODO: Make nextSelection explicitly caching, not dangerous state
        if (this.nextSelection == undefined) {
            this.regenerateNextSelection(contextSpace)
        };
        return this.nextSelection;
    }

    regenerateNextSelection(contextSpace) {
        this.nextSelection = [];
    }

    clearNextSelection() {
        this.nextSelection = undefined;
    }

    serialize() { 
        return JSON.stringify(this);
    }
}

class Location extends AbstractEntity {
    constructor(x, y, traversable) {
        super();
        this.color = getRandomColor();
        this.x = x;
        this.y = y;
        this.traversable = traversable;
    }

    regenerateNextSelection(contextSpace) {
        this.nextSelection = [new Confirmation(this)];
    }
}

class Confirmation {
    constructor(basis, message, isEnd) { // (basis: Selectable) : Confirmation
        this.basis = basis;
        this.message = message || "Missing message";
        this.isEnd = isEnd || false;
    }

    getNextSelection(contextSpace) {
        return [];
    }
}

class BaseUnit extends AbstractEntity { // isa Entity
    constructor(stats, name, loc, team, actionClasses) {
        super();
        this.range = stats.range || 3;
        this.arange = stats.arange || 3;
        this.maxhp = stats.maxhp || 3;
        this.hp = this.maxhp;
        this.dmg = stats.dmg || 1
        this.name = name;
        this.loc = loc;
        this.team = team;
        this.actionClasses = actionClasses
    }

    isAlive() {
        return this.hp > 0;
    }

    regenerateNextSelection(contextSpace) {
        if (this.isAlive()) {
            this.nextSelection = this.actionClasses.map((a, i) => new a(i, this));
        } else {
            this.nextSelection = [];
        }
    }
}

class Unit extends BaseUnit { // isa Entity
    constructor(name, loc, team, stats) {
        super(stats || {}, name, loc, team, [MoveAction, AttackAction, ReadyCounterAction]);
    }
}

class Action extends AbstractEntity {
    constructor(actionType, text, nextSelFn, digestFn, index) { // (origin: Location, destination: Location) : Path
        super();
        this.actionType = actionType;
        this.text = text;
        this.nextSelFn = nextSelFn;
        this.digestFn = digestFn;
        this.index = index;
    }

    isHit(mousePos) {
        if (mousePos.x >= this.xOffset && mousePos.x < this.xOffset + this.width) {
            if (mousePos.y >= this.yOffset && mousePos.y < this.yOffset + this.height) {
                return true;
            }
        } else {
            return false;
        }
    }

    getNextSelection(contextSpace) {
        if (this.nextSelection == undefined) {
            this.regenerateNextSelection(contextSpace)
        };
        return this.nextSelection;
    }

    regenerateNextSelection(contextSpace) {
        return this.nextSelFn;
    }

    clearNextSelection() {
        this.nextSelection = undefined;
    }
}

class MoveAction extends Action {
    constructor(index, contextUnit) {
        const digestFn = function (stack) {
            let u = stack[1];
            let paths = stack.slice(2).filter(p => (p.constructor.name == "Path"));
            return paths.map(p => new MoveEffect(u, p.destination)).concat([new EndTurnEffect()]);
        }
        super("MOVE", "M", () => { }, digestFn, index); //nextSelFn, digestFn
        this.unit = contextUnit;
    }

    regenerateNextSelection(contextSpace) { // (contextSpace: Space): Path[] 
        console.log("REGENERATE MOVE NEXT_SEL");
        this.nextSelection = contextSpace.getReachable(this.unit.loc, this.unit.range).map(dest => new Path(this.unit.loc, dest, contextSpace, this.unit.range));
    }
}

class AttackAction extends Action {
    constructor(index, contextUnit) {
        const digestFn = function (stack) {
            let u = stack[1];
            let loc = stack[3];
            return [new DamageEffect(u, loc), new EndTurnEffect()];
        }
        super("ATTACK", "A", () => { }, digestFn, index);
        this.unit = contextUnit;
    }

    regenerateNextSelection(contextSpace) { // (contextSpace: Space): Location[] 
        console.log("REGENERATE ATTACK NEXT_SEL");
        this.nextSelection = contextSpace.units
            .filter(u => contextSpace.getDistanceDirect(u.loc, this.unit.loc) < this.unit.arange)
            .map(u => u.loc);
    }
}

class ReadyCounterAction extends Action {
    constructor(index, contextUnit) {
        const digestFn = function (stack) {
            return [new SetObserverEffect(stack), new EndTurnEffect()];
        }
        super("COUNTER", "C", () => { }, digestFn, index);
        this.unit = contextUnit;
    }

    regenerateNextSelection(contextSpace) { // (contextSpace: Space): Confirmation[]
        this.nextSelection = [new Confirmation(this)];
    }
}

class Path {
    constructor(origin, destination, contextSpace, total_range) { // (origin: Location, destination: Location) : Path
        this.origin = origin;
        this.destination = destination;
        this.locations = contextSpace.getPath(origin, destination);
        this.clearNextSelection();
        this.remaining_range = total_range - this.locations.length;
    }

    getNextSelection(contextSpace) {
        if (this.nextSelection == undefined) {
            this.regenerateNextSelection(contextSpace)
        };
        return this.nextSelection;
    }

    regenerateNextSelection(contextSpace) { // (contextSpace: Space): Location[] 
        if (this.remaining_range == 0 || this.origin == this.destination) {
            this.nextSelection = [new Confirmation(this)];
        } else {
            this.nextSelection = contextSpace.getReachable(this.destination, this.remaining_range).map(next_dest => new Path(this.destination, next_dest, contextSpace, this.remaining_range));
        }
    }

    clearNextSelection() {
        this.nextSelection = undefined;
    }
}

class BaseControlQueue extends AbstractEntity {
    constructor(contextSpace) {
        super()
    }

    checkEnd(contextSpace) {
        state = contextSpace.state
        let end = state.gameEndFn(contextSpace);
        if (end.length > 0) { console.log("GAME OVER"); return end; }
        else { return undefined; }
    }

    calculateNext(contextSpace) {
        return [];
    }

    getNextSelection(contextSpace) {
        return this.checkEnd(contextSpace) || this.calculateNext(contextSpace);
    }
}

class TicTacToeControlQueue extends BaseControlQueue {
    constructor(contextSpace) {
        super()
        // this.nextSelection = contextSpace.locations.flatMap(l => l);
    }

    calculateNext(contextSpace) {
        return Array.from(difference(new Set(contextSpace.locations.flatMap(l => l)), new Set(contextSpace.units.map(u => u.loc))));
    }
}

class ConnectFourControlQueue extends BaseControlQueue {
    constructor(contextSpace) {
        super()
        // this.nextSelection = contextSpace.locations.flatMap(l => l);
    }

    calculateNext(contextSpace) {
        return Array.from(difference(new Set(contextSpace.locations.flatMap(l => l)), new Set(contextSpace.units.map(u => u.loc))));
    }
}

class BasicTacticsControlQueue extends BaseControlQueue {
    constructor(contextSpace) {
        super()
    }

    calculateNext(contextSpace) {
        return contextSpace.units.filter(u => u.team == contextSpace.state.team);
    }
}

module.exports = {
    Unit: Unit,
    Location: Location,
    TicTacToeControlQueue: TicTacToeControlQueue,
    ConnectFourControlQueue: ConnectFourControlQueue,
    BasicTacticsControlQueue: BasicTacticsControlQueue,
    Confirmation: Confirmation,
}