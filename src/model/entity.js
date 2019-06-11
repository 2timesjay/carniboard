utils = require('../utilities/utilities.js');
Array.prototype.flatMap = utils.flatMap;

effects = require("./effect");
AddUnitEffect = effects.AddUnitEffect;
EndTurnEffect = effects.EndTurnEffect;
MoveEffect = effects.MoveEffect;
DamageEffect = effects.DamageEffect;
SetObserverEffect = effects.SetObserverEffect;

difference = (set1, set2) => new Set([...set1].filter(num => !set2.has(num)));

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function hashIncr(hash, val){
    return hash << 5 + val % 805306457;
}

class AbstractEntity {
    constructor() {
    }

    getNext(stack) { 
        if (this.next == undefined){
            this._calculateNext(stack);
        }
        return this.next;
    }

    clearNext() {
        this.next = undefined;
    }

    _calculateNext(sp) {
        this.next = [];
    }

    hash(input) {
        return 1776 * 2018;
    }

    clone() {
        return Object.assign(new this.constructor(), this);
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

    _calculateNext(sp) {
        this.next = [new Confirmation(this)];
    }

    hash(){
        let hash = super.hash();
        hash = hashIncr(this.x);
        hash = hashIncr(this.y);
        hash = hashIncr(this.traversable);
        return hash;
    }
}

class Confirmation { // TODO: Make entity?
    constructor(basis, message, isEnd) { // (basis: Selectable) : Confirmation
        this.basis = basis;
        this.message = message || "Missing message";
        this.isEnd = isEnd || false;
    }

    getNext(stack) {
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
        this.dmg = stats.dmg || 1;
        this.name = name;
        this.loc = loc;
        this.team = team;
        this.actionClasses = actionClasses;
    }

    isAlive() {
        return this.hp > 0;
    }

    _calculateNext(sp) {
        if (this.isAlive()) {
            this.next = this.actionClasses.map((a, i) => new a(i, this));
        } else {
            this.next = [];
        }
    }

    hash() {
        let hash = super.hash();
        hash = hashIncr(this.range);
        hash = hashIncr(this.arange);
        hash = hashIncr(this.maxhp);
        hash = hashIncr(this.hp);
        hash = hashIncr(this.dmg);
        //hash = hashIncr(this.name);
        hash = hashIncr(this.loc.hash());
        hash = hashIncr(this.team);
        //hash = hashIncr(actionClasses);
        return hash;
    }
}

class BasePiece extends AbstractEntity { // isa Entity
    constructor(team, loc) {
        super();
        this.team = team;
        this.loc = loc;
        this.actionClasses = [];
    }

    _calculateNext(stack) {
        if (this.isAlive()) {
            this.next = this.actionClasses.map((a, i) => new a(i, this));
        } else {
            this.next = [];
        }
    }

    hash() {
        let hash = super.hash();
        hash = hashIncr(this.loc.hash());
        hash = hashIncr(this.team);
        return hash;
    }

    isAlive() {
        return this.loc != null;
    }
}

class CheckersPiece extends BasePiece { // isa Entity
    constructor(team, loc, isKing) {
        super(team, loc);
        this.actionClasses = [CheckersMoveAction];
        this.isKing = isKing;
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

    _calculateNext(sp) {
        return this.nextSelFn;
    }

    clearNext() {
        this.next = undefined;
    }
}

class MoveAction extends Action {
    constructor(index, contextUnit) {
        const digestFn = function (stack) {
            let u = stack[1];
            let paths = stack.slice(2).filter(p => (p.constructor.name == "Path"));
            return paths.map(p => new MoveEffect(u, p.destination)).concat([new EndTurnEffect()]);
        };
        super("MOVE", "M", () => { }, digestFn, index); //nextSelFn, digestFn
        this.unit = contextUnit;
    }

    _calculateNext(sp) { // (sp: Space): Path[] 
        console.log("CALCULATE INITIAL PATH SEL");
        // TODO: Paths from next_selection should reuse what's enumerated in MoveAction.
        let path = new Path(this.unit.loc, this.unit.loc, sp, this.unit.range, this.nh);
        path.calculateInitial(sp);
        this.next = path.next;
    }
}

class CheckersMoveAction extends Action {


    constructor(index, contextUnit) {
        const digestFn = function (stack) {
            let u = stack[1];
            let paths = stack.slice(2).filter(p => (p.constructor.name == "CheckersPath"));
            return paths.map(p => new MoveEffect(u, p.destination)).concat([new EndTurnEffect()]);
        };
        super("CMOVE", "CM", () => {}, digestFn, index); //nextSelFn, digestFn
        this.unit = contextUnit;
        this.nh = this.unit.team == 0 ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];
    }

    _calculateNext(sp) { // (sp: Space): Path[] 
        console.log("CALCULATE INITIAL CHECKERS PATH SEL");
        // TODO: Paths from next_selection should reuse what's enumerated in MoveAction.
        // TODO: initialize selection from CheckersPath object instead of copying its logic here.
        // TODO: this.constructor doesn't work here.
        let checkersPath = new CheckersPath(this.unit.loc, this.unit.loc, sp, 1, this.nh);
        checkersPath.calculateInitial(sp);
        this.next = checkersPath.next;
    }
}

class AttackAction extends Action {
    constructor(index, contextUnit) {
        const digestFn = function (stack) {
            let u = stack[1];
            let loc = stack[3];
            return [new DamageEffect(u, loc), new EndTurnEffect()];
        };
        super("ATTACK", "A", () => { }, digestFn, index);
        this.unit = contextUnit;
    }

    _calculateNext(sp) { // (sp: Space): Location[] 
        console.log("RECALCULATE ATTACK NEXT_SEL");
        this.next = sp.units
            .filter(u => sp.getDistanceDirect(u.loc, this.unit.loc) < this.unit.arange)
            .map(u => u.loc);
    }
}

class ReadyCounterAction extends Action {
    constructor(index, contextUnit) {
        const digestFn = function (stack) {
            return [new SetObserverEffect(stack), new EndTurnEffect()];
        };
        super("COUNTER", "C", () => { }, digestFn, index);
        this.unit = contextUnit;
    }

    _calculateNext(sp) { // (sp: Space): Confirmation[]
        this.next = [new Confirmation(this)];
    }
}

class Path extends AbstractEntity { // TODO: Simplify constructor - no destination
    constructor(origin, destination, sp, total_range, nh) { // (origin: Location, destination: Location) : Path
        super();
        this.origin = origin;
        this.destination = destination;
        this.locations = sp.getPath(origin, destination, nh);
        this.nh = nh;
        this.clearNext();
        this.remaining_range = total_range - this.locations.length;
    }

    calculateInitial(sp) { // (sp: Space): Location[] 
        if (this.remaining_range == 0) {
            this.next = [new Confirmation(this)];
        } else {
            this.next = sp
                .getReachable(this.destination, this.remaining_range)
                .map(next_destination => new Path(
                    this.destination, next_destination, sp, this.remaining_range));
        }
    }

    _calculateNext(sp) { // (sp: Space): Location[] 
        if (this.remaining_range == 0 || this.origin == this.destination) {
            this.next = [new Confirmation(this)];
        } else {
            this.next = sp
                .getReachable(this.destination, this.remaining_range)
                .map(next_destination => new Path(
                    this.destination, next_destination, sp, this.remaining_range));
        }
    }

    clearNext() {
        this.next = undefined;
    }
}

class CheckersPath extends Path {
    constructor(origin, destination, sp, total_range, nh, jump, king) { // (origin: Location, destination: Location) : Path
        super(origin, destination, sp, total_range, nh);
        this.jump = jump;
        this.king = king;
    }

    _getJumpPaths(sp){
        // returns a length-2 list of locs visited on a jump [(jumpedLoc, JUMP), (landLoc, LAND)]
        let jumps = sp.getAdjacent(this.origin, this.nh)
            .filter(jumped => sp.isOccupied(jumped));
        // TODO: filter to occupied by opposite team.
        if (jumps.length > 0) {
            let jump_paths = jumps
                .map(jumped => {
                    // An open space in the same direction as the jumped piece.
                    let relCo = sp.getRelativeCo(this.origin, jumped);
                    let destination = sp.getByRelativeCo(jumped, relCo);
                    return [jumped, destination];
                });
            jump_paths = jump_paths    
                .filter(pair => {
                    let destination = pair[1]; // TODO: use nice destructuring approach?
                    return destination != null && !sp.isOccupied(destination);
                });
            return jump_paths;
        } else {
            return [];
        }
    }
    
    _getMovePaths(sp){
        return sp.getAdjacent(this.origin, this.nh)
            .filter(destination => !sp.isOccupied(destination))
            .map(destination => [destination]);
    }
    
    calculateInitial(sp) { // (sp: Space): CheckersPath[]
        // TODO: clean up, reinstate origin/destination check.
        if (this.remaining_range == 0) {
            this.next = [new Confirmation(this)];
        } else {
            this.next = this._getMovePaths(sp).concat(this._getJumpPaths(sp))
                .map(path => path[path.length - 1])
                .map(next_destination => new CheckersPath(
                    this.destination || this.origin, next_destination, sp, this.remaining_range, this.nh, this.jump, this.king));
        }
        console.log("Initial Checkers Paths");
        console.log(this.next);
        return this.next;
    }

    _calculateNext(sp) { // (sp: Space): CheckersPath[]
        // TODO: clean up, reinstate origin/destination check.
        if (this.remaining_range == 0 || this.origin == this.destination) {
            this.next = [new Confirmation(this)];
        } else {
            this.next = this._getMovePaths(sp).concat(this._getJumpPaths(sp))
                .map(path => path[path.length - 1])
                .map(next_destination => new CheckersPath(
                    this.destination || this.origin, next_destination, sp, this.remaining_range, this.nh, this.jump, this.king));
        }
        console.log("Checkers Paths");
        console.log(this.next);
        return this.next;
    }

    clearNext() {
        this.next = undefined;
    }
}

class BaseControlQueue extends AbstractEntity {
    constructor() {
        super();
    }

    checkEnd(sp) {
        state = sp.state;
        let end = state.gameEndFn(sp);
        if (end.length > 0) { console.log("GAME OVER"); return end; }
        else { return undefined; }
    }

    incrementQueue(sp) {
        return [];
    }

    getNext(stack) {
        return this.checkEnd(stack) || this.incrementQueue(stack);
    }

    clone() {
        return new this.constructor();
    }
}

class TicTacToeControlQueue extends BaseControlQueue {
    constructor() {
        super();
    }

    incrementQueue(sp) {
        return Array.from(difference(new Set(sp.locations.flatMap(l => l)), new Set(sp.units.map(u => u.loc))));
    }
}

class ConnectFourControlQueue extends BaseControlQueue {
    constructor() {
        super();
    }

    incrementQueue(sp) {
        return Array.from(difference(new Set(sp.locations.flatMap(l => l)), new Set(sp.units.map(u => u.loc))));
    }
}

class CheckersControlQueue extends BaseControlQueue {
    constructor() {
        super();
    }

    incrementQueue(stack) {
        let state = stack.state;
        return state.units.filter(u => u.team == state.team);
    }

    checkEnd(stack) {
        let state = stack.state;
        let end = state.gameEndFn(stack);
        if (end.length > 0) { console.log("GAME OVER"); return end; }
        else { return undefined; }
    }

    getNext(stack) {
        return this.checkEnd(stack) || this.incrementQueue(stack);
    }

    clone() {
        return new this.constructor();
    }
}


class BasicTacticsControlQueue extends BaseControlQueue {
    constructor() {
        super();
    }

    incrementQueue(sp) {
        return sp.units.filter(u => u.team == sp.state.team);
    }
}

module.exports = {
    AbstractEntity: AbstractEntity,
    Unit: Unit,
    CheckersPiece: CheckersPiece,
    Location: Location,
    CheckersControlQueue: CheckersControlQueue,
    TicTacToeControlQueue: TicTacToeControlQueue,
    ConnectFourControlQueue: ConnectFourControlQueue,
    BasicTacticsControlQueue: BasicTacticsControlQueue,
    Confirmation: Confirmation,
    // Actions
    MoveAction: MoveAction,
    CheckersMoveAction: CheckersMoveAction,
    AttackAction: AttackAction,
    ReadyCounterAction: ReadyCounterAction
};