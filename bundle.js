(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
entity = require('../model/entity')
Unit = entity.Unit
Location = entity.Location
TicTacToeControlQueue = entity.TicTacToeControlQueue
ControlQueue = entity.ControlQueue
Confirmation = entity.Confirmation

effect = require('../model/effect')
AddUnitEffect = effect.AddUnitEffect
EndTurnEffect = effect.EndTurnEffect

Space = require('../model/space').Space
State = require('../model/state').State

makeTicTacToe = function () {
    let locations = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ].map(
        (row, y) => row.map(
            (loc, x) => new Location(x, y, loc)
        ));
    let units = [];
    let space = new Space(locations, units, 3);
    space.k = 3;

    gameEndConfirmation = function (spc) {
        let t0 = spc.units.filter(u => u.team == 0);
        let t1 = spc.units.filter(u => u.team == 1);
        function threeInARow(team) {
            let xs = team.map(u => u.loc.x);
            let ys = team.map(u => u.loc.y);
            function udlr(coords) {
                let counts = [0, 0, 0];
                for (let i = 0; i < coords.length; ++i) {
                    counts[coords[i]] += 1;
                }
                return Math.max(...counts) == 3;
            }
            function diag(units) {
                let hashes = units.map(u => u.loc.y * 3 + u.loc.x);
                return ((hashes.indexOf(0) >= 0 && hashes.indexOf(4) >= 0 && hashes.indexOf(8) >= 0)
                    || (hashes.indexOf(2) >= 0 && hashes.indexOf(4) >= 0 && hashes.indexOf(6) >= 0))
            }
            return udlr(xs) || udlr(ys) || diag(team);
        }
        let over = (spc.units.length == 9) || threeInARow(t0) || threeInARow(t1);
        if (over) {
            return [new Confirmation(undefined, "GAME OVER", true)];
        } else {
            return [];
        }
    };
    digestFnGetter = function (stk) {
        return function (stk) {
            let location = stk[1];
            return [new AddUnitEffect(location), new EndTurnEffect()];
        }; // TODO: Add unit
    }
    stack = [new TicTacToeControlQueue(space)];
    state = new State(space, stack, gameEndConfirmation, digestFnGetter);
    space.state = state;
    return state;
}

module.exports = {
    makeTicTacToe: makeTicTacToe
}
},{"../model/effect":2,"../model/entity":3,"../model/space":4,"../model/state":5}],2:[function(require,module,exports){
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
        contextSpace.units.push(new Unit("", contextSpace.getLocation(this.destination), contextSpace.state.team));
        return this;
    }
}

class EndTurnEffect extends Effect {
    constructor() {
        super();
    }

    execute(contextSpace) {
        contextSpace.state.advance();
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
},{}],3:[function(require,module,exports){
Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

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

class ControlQueue extends BaseControlQueue {
    constructor(contextSpace) {
        super()
        // this.nextSelection = contextSpace.units;
    }

    calculateNext(contextSpace) {
        return contextSpace.units.filter(u => u.team == contextSpace.team);
    }
}

module.exports = {
    Unit: Unit,
    Location: Location,
    TicTacToeControlQueue: TicTacToeControlQueue,
    ControlQueue: ControlQueue,
    Confirmation: Confirmation,
}
},{}],4:[function(require,module,exports){
function argmin(arr) {
    let min = Math.min(...arr);
    return arr.indexOf(min);
}

Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

difference = (set1, set2) => new Set([...set1].filter(num => !set2.has(num)))

union = (set1, set2) => new Set([...set1, ...set2])

class Space {
    constructor(locations, units, k) {
        this.k = k;
        this.locations = locations;
        this.units = units;
    }

    getAdjacent(loc) { // (loc: Location): Location[]
        function isValidLoc(adj) { return adj != undefined && adj.traversable; }
        const x = loc.x;
        const y = loc.y;
        let adjList = []
        let row = this.locations[y - 1];
        if (row != undefined) {
            let adj = row[x];
            if (isValidLoc(adj)) {
                adjList.push(adj);
            }
        }
        row = this.locations[y + 1];
        if (row != undefined) {
            let adj = row[x];
            if (isValidLoc(adj)) {
                adjList.push(adj);
            }
        }

        row = this.locations[y];
        if (row != undefined) {
            let adj = row[x - 1];
            if (isValidLoc(adj)) {
                adjList.push(adj);
            }
            adj = row[x + 1];
            if (isValidLoc(adj)) {
                adjList.push(adj);
            }
        }
        return adjList;
    }

    getReachable(loc, range) { //(loc: Location, range: int): Location[] 
        // TODO: Should this enumerate paths?
        let reached = new Set([loc]);
        let next = new Set();
        let frontier = new Set([...reached]);
        let self = this;
        for (let i = 1; i <= range; i++) {
            next = Array.from(frontier).flatMap(l => self.getAdjacent(l));
            frontier = difference(next, frontier);
            reached = union(reached, next);
        }
        return Array.from(reached);
    }

    getDistance(origin, destination) {
        let dist = 0;
        let prevReachable = [];
        let curReachable = this.getReachable(origin, dist);
        while (curReachable.indexOf(destination) == -1 && prevReachable.length != curReachable.length) {
            dist++;
            prevReachable = curReachable;
            curReachable = this.getReachable(origin, dist);
        }
        return dist;
    }

    getDistanceDirect(origin, destination) {
        return Math.abs(origin.x - destination.x) + Math.abs(origin.y - destination.y);
    }

    getPath(origin, destination) { // TODO: Make efficient and safe.
        if (!origin.traversable || !destination.traversable) { return -1; }
        let dist = this.getDistance(origin, destination);
        if (dist == 0) { return []; }
        let adjList = this.getAdjacent(origin);
        let adjDistances = adjList.map(adj => this.getDistance(adj, destination));
        let nearestAdjIndex = argmin(adjDistances);
        let nearestAdj = adjList[nearestAdjIndex];
        return [nearestAdj].concat(this.getPath(nearestAdj, destination));
    }

    getUnit(location) { // (location: Location) => Unit[]
        return this.units.filter(u => u.loc.x == location.x && u.loc.y == location.y);
    }

    getLocation(location) { // (location: Location) => Unit[]
        return this.locations[location.y][location.x];
    }

    triggerObservers(effect) { // (effect: Effect) => Effect[]
        let triggeredEffects = this.observers.flatMap(o => o.trigger(effect));
        this.observers = this.observers.filter(o => o.active);
        return triggeredEffects;
    }
}

module.exports = {
    Space: Space
}
},{}],5:[function(require,module,exports){
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

    advance() {
        this.team = 1 - this.team;
    }
}

module.exports = {
    State: State
}
},{}],6:[function(require,module,exports){
Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

makeTicTacToe = require('../model/construction').makeTicTacToe;
draw = require('../view/draw');
redraw = draw.redraw;
addListeners = draw.addListeners;
checkConfirmation = draw.checkConfirmation;

timeline = require("../view/timeline");
makeTimeline = timeline.makeTimeline;
ListView = timeline.ListView;
createTimelineController = timeline.createTimelineController;

const k = 3;
const size = 100;
const canvas = draw.makeCanvas(k * 100, k * size, true);
const context = canvas.getContext("2d");

var state = makeTicTacToe();
var triggerList = [];

var tl = new ListView([]);
var tlc = createTimelineController(
    tl, 
    ()=> { 
        state = makeTicTacToe();
        console.log("REAPPLY TIMELINE");
        tl.value.flatMap(e => e).map(e => e.execute(state.space));
    }
);
var tl_images = [];
var tl_canvas = draw.makeCanvas(k*size/2, k*size/2, true);
var tl_render_fn = () => makeTimeline(context, tl, tl_images, tl_canvas);

var loop = function() {
    redraw(context, state, triggerList, size);
    addListeners(context, triggerList);
    checkConfirmation(state, tl); // TODO: Timeline
    tl_render_fn();
}
loop();
canvas.addEventListener(
    'mousemove', 
    () => loop()
);
canvas.addEventListener(
    'click',
    () => loop()
);

},{"../model/construction":1,"../view/draw":8,"../view/timeline":9}],7:[function(require,module,exports){
const size = 100;

function getMousePos(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
}
function makeRect(x, y, context, size, clr, lfa) {
    const alpha = lfa == undefined ? 1.0 : lfa;
    const color = clr == undefined ? "#000000" : clr;
    context.globalAlpha = alpha;
    context.beginPath();
    context.rect(x, y, size, size);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 4;
    context.strokeStyle = 'black';
    context.stroke();
    context.globalAlpha = 1.0;
}

function makeCircle(x, y, context, size, clr, lfa) {
    const alpha = lfa == undefined ? 1.0 : lfa;
    const color = clr == undefined ? "#000000" : clr;
    var centerX = x;
    var centerY = y;
    var radius = size;

    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 5;
    // context.strokeStyle = color;
    // context.stroke();
    context.globalAlpha = 1.0;
}
class AbstractDisplay {
    constructor(entity) {
        this.entity = entity;
        this.preview = false;
        this.select = false;
    }

    display(context) {
        if (this.select) {
            this.selectDisplay(context);
        } else if (this.preview) {
            this.previewDisplay(context);
        } else {
            this.basicDisplay(context);
        }
    }

    basicDisplay(context) {
    }

    previewDisplay(context) {
    }

    selectDisplay(context) {
    }

    isHit(mousePos) {
    }

    _select(stack) { // INTERFACE
        if (!this.select) {
            console.log("ACTUALLY SELECTED: ", this.entity);
            this.select = true;
            stack.push(this.entity);
            console.log(stack);
        }
    }

    _deselect(stack) { // INTERFACE
        let stackIndex = stack.indexOf(this.entity);
        if (this.select && stackIndex == (stack.length - 1)) {
            console.log("Deselect: ", this.entity);
            this.select = false;
            this.preview = false; // De-select whether automated or manual should end preview.
            stack.splice(stackIndex, stackIndex + 1);
            this.entity.clearNextSelection();
        }
    }

    selectListener(canvas, stack) {
        // Select by click - clicks off this element de-select.
        let context = canvas.getContext("2d");
        let self = this;
        let trigger = function (e) {
            // console.log("Expended? ",e.expended);
            if (e.type == "click") {
                let mousePos = getMousePos(canvas, e);
                if (self.isHit(mousePos)) {
                    self._select(stack);
                    return true;
                } else {
                    self._deselect(stack);
                    return false;
                }
            }
        }
        return trigger;
    }

    previewListener(canvas) {
        // Preview if not selected.
        let context = canvas.getContext("2d");
        let self = this;
        let trigger = function (e) {
            if (e.type == "mousemove") {
                let mousePos = getMousePos(canvas, e);
                if (self.select) {
                    return;
                }
                if (self.isHit(mousePos)) {
                    if (!self.select) {
                        self.preview = true;
                    }
                    return true;
                } else {
                    self.preview = false;
                    return false;
                }
            }
        }
        return trigger;
    }

}

class LocationDisplay extends AbstractDisplay {
    constructor(loc) {
        super(loc);
        this.loc = loc;
        this.xOffset = this.loc.x * size + 0.1 * size;
        this.yOffset = this.loc.y * size + 0.1 * size;
        this.size = size * 0.8;
        this.width = size * 0.8;
        this.height = size * 0.8;
    }

    render(context, clr) {
        if (!this.loc.traversable) { return; }
        makeRect(this.xOffset, this.yOffset, context, this.size, clr);
    }

    passiveDisplay(context, clr) {
        const color = clr == undefined ? this.loc.color : clr;
        this.render(context, color);
    }

    basicDisplay(context) {
        this.render(context, 'grey');
    }

    previewDisplay(context) {
        this.render(context, 'yellow');
    }

    selectedDisplay(context) {
        this.render(context, 'red');
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
}

class UnitDisplay extends AbstractDisplay {
    constructor(unit) {
        super(unit);
        this.unit = unit;
        this.size = 0.6 * size;
        this.width = 0.6 * size;
        this.height = 0.6 * size;
    }

    get xOffset() {
        return this.unit.loc.x * size + 0.2 * size;
    }

    get yOffset() {
        return this.unit.loc.y * size + 0.2 * size;
    }

    render(context, clr, lfa) {
        const color = clr == undefined ? "black" : clr;
        const alpha = lfa == undefined ? 0.5 ** (this.unit.maxhp - this.unit.hp) : lfa;
        makeRect(this.xOffset, this.yOffset, context, this.size, color, alpha);
    }

    passiveDisplay(context) {
        this.render(context, this.unit.team == 0 ? 'red' : 'blue');
    }

    basicDisplay(context) {
        this.render(context, 'black');
    }

    previewDisplay(context) {
        this.render(context, 'yellow');
    }

    selectDisplay(context) {
        this.render(context, 'red');
    }

    isHit(mousePos) {
        var inXBounds = mousePos.x >= this.xOffset && mousePos.x < this.xOffset + this.size;
        var inYBounds = mousePos.y >= this.yOffset - this.size && mousePos.y < this.yOffset;
        return inXBounds && inYBounds;
    }
}

class ActionDisplay extends AbstractDisplay {
    constructor(action) {
        super(action);
        this.action = action;
        this.size = size * 0.8
    }

    get xOffset() {
        return this.action.unit.display.xOffset;
    }

    get yOffset() {
        return this.action.unit.display.yOffset + this.size * this.action.index;
    }

    render(context, color) {
        context.fillStyle = color;
        context.font = 0.8 * this.size + "px Trebuchet MS";
        context.fillText(this.action.text, this.xOffset, this.yOffset);
    }

    basicDisplay(context) {
        this.render(context, 'black');
    }

    previewDisplay(context) {
        this.render(context, 'yellow');
    }

    selectDisplay(context) {
        this.render(context, 'red');
    }

    isHit(mousePos) {
        var inXBounds = mousePos.x >= this.xOffset && mousePos.x < this.xOffset + this.size;
        var inYBounds = mousePos.y >= this.yOffset - this.size && mousePos.y < this.yOffset;
        return inXBounds && inYBounds;
    }
}

class PathDisplay extends AbstractDisplay {
    constructor(path) {
        super(path);
        this.path = path;
        this.preview = false;
        this.select = false;
        this.size = size
    }

    basicDisplay(context) {
        const color = 'yellow';
        const alpha = 0.5
        const dest = this.path.destination;
        makeCircle(dest.x * this.size + 0.5 * this.size, dest.y * this.size + 0.5 * this.size, context, 0.2 * this.size, color, alpha);
    }

    previewDisplay(context) {
        let locations = [this.path.origin].concat(this.path.locations)
        let self = this;
        locations.forEach(function (loc, i) {
            if (i > 0) {
                // Draw rectangle/path from one to another.
                const prev_loc = locations[i - 1];
                const dx = loc.x - prev_loc.x;
                const dy = loc.y - prev_loc.y;

                context.globalAlpha = 0.5;
                context.beginPath();
                context.fillStyle = 'red';
                context.fill();
                context.lineWidth = 0.4 * self.size;
                context.moveTo(prev_loc.x * self.size + 0.5 * self.size, prev_loc.y * self.size + 0.5 * self.size);
                context.lineTo(loc.x * self.size + 0.5 * self.size, loc.y * self.size + 0.5 * self.size);
                context.strokeStyle = 'yellow';
                context.stroke();
                context.globalAlpha = 1.0;
            }
            // Draw circle in middle of grid squares.
            makeCircle(loc.x * self.size + 0.5 * self.size, loc.y * self.size + 0.5 * self.size, context, 0.2 * self.size, 'yellow', 0.5);
        });
    }

    selectDisplay(context) {
        let locations = [this.path.origin].concat(this.path.locations)
        let self = this;
        locations.forEach(function (loc, i) {
            if (i > 0) {
                // Draw rectangle/path from one to another.
                const prev_loc = locations[i - 1];
                const dx = loc.x - prev_loc.x;
                const dy = loc.y - prev_loc.y;

                context.beginPath();
                context.fillStyle = 'red';
                context.fill();
                context.lineWidth = 0.4 * self.size;
                context.moveTo(prev_loc.x * self.size + 0.5 * self.size, prev_loc.y * self.size + 0.5 * self.size);
                context.lineTo(loc.x * self.size + 0.5 * self.size, loc.y * self.size + 0.5 * self.size);
                context.strokeStyle = 'red';
                context.stroke();
                context.globalAlpha = 1.0;
            }
            // Draw circle in middle of grid squares.
            makeCircle(loc.x * self.size + 0.5 * self.size, loc.y * self.size + 0.5 * self.size, context, 0.2 * self.size, 'red', 1.0);
        });
    }

    isHit(mousePos) {
        return this.path.destination.display.isHit(mousePos);
    }
}

class ConfirmationDisplay extends AbstractDisplay {
    constructor(confirmation) {
        super(confirmation);
        this.confirmation = confirmation;
    }

    render(context, clr, lfa) {
        makeRect(100, 50, context, 200, "white", 1);
        context.fillStyle = "black";
        context.font = 30 + "px Trebuchet MS";
        context.fillText(this.confirmation.message, 100, 100);
    }

    passiveDisplay(context) {
        this.render(context, 'grey');
    }

    basicDisplay(context) {
        this.render(context, 'black');
    }

    previewDisplay(context) {
        this.render(context, 'yellow');
    }

    selectDisplay(context) {
        this.render(context, 'red');
    }

    isHit(mousePos) {
    }

}

module.exports = {
    Unit: UnitDisplay,
    Location: LocationDisplay,
    Path: PathDisplay,
    Action: ActionDisplay,
    Confirmation: ConfirmationDisplay
}
},{}],8:[function(require,module,exports){
display = require('../view/display')

var makeCanvas = function (width, height, attach) {
    console.log("make canvas");
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    if (attach) {
        document.body.appendChild(canvas);
    }
    return canvas;
}
var addDisplay = function(entity){
    var className = entity.constructor.name;
    var displayConstructor = display[className];
    if (displayConstructor == undefined){ return undefined; }
    else { return new displayConstructor(entity); }
}

var tryAttachDisplay = function(entity) {
    if (entity.display != undefined) { return; }
    else {
        var display = addDisplay(entity);
        entity.display = display;
    }
}

var redraw = function(context, state, triggerList, size) {
    let space = state.space;
    let stack = state.stack;
    let k = space.k;
    context.clearRect(0, 0, k * size, k * size);
    const canvas = context.canvas;

    triggerList.splice(0, triggerList.length);
    function showSpace(space) {
        let locs = space.locations;
        for (let x = 0; x < locs.length; x++) {
            let row = locs[x];
            for (let y = 0; y < row.length; y++) {
                let loc = row[y];
                tryAttachDisplay(loc);
                loc.display.passiveDisplay(context);
            }
        }
        space.units.forEach(u => {
            tryAttachDisplay(u); 
            u.display.passiveDisplay(context); 
        });
    }
    function showElement(elem, listen_elem, show_children, listen_children) {
        tryAttachDisplay(elem);
        if (elem.display != undefined) {
            elem.display.display(context);
            if (listen_elem) {
                triggerList.unshift(elem.display.previewListener(canvas));
                triggerList.unshift(elem.display.selectListener(canvas, stack));
            }
        }
        if (show_children) {
            let selection = elem.getNextSelection(space);
            for (let i = 0; i < selection.length; i++) {
                let s = selection[i];
                tryAttachDisplay(s);
                s.display.display(context);
                if (listen_children) {
                    triggerList.unshift(s.display.previewListener(canvas));
                    triggerList.unshift(s.display.selectListener(canvas, stack));
                }
            }
        }
    }
    function showInputStack(stack) {
        let topLayer = stack.length - 1;
        // For every element in the inputStack display if selected. 
        // Listen to deselect and only deselect for all or just the top element in the stack.
        // Add preview and select listeners for nextSel only.
        for (let layer = 0; layer < stack.length; layer++) {
            let elem = stack[layer];
            showElement(elem, false, false, false);
            if (layer == topLayer) {
                showElement(elem, true, true, true);
            }
        }
    }
    showSpace(space, stack);
    showInputStack(stack);
}

var checkConfirmation = function (state, timelineView) {
    let space = state.space
    let stack = state.stack;
    let digestFnGetter = state.digestFnGetter;
    let topSel = stack[stack.length - 1].getNextSelection(space);
    if (topSel.length > 0 && topSel[0].constructor.name == "Confirmation" && !topSel[0].isEnd) {
        console.log("CONFIRMED: ", stack);
        let digestFn = digestFnGetter(stack);
        let effects = digestFn(stack);
        while (stack.length > 1) {
            let top = stack[stack.length - 1];
            top.display._deselect(stack);
        }
        let executed_effects = effects.map(e => e.execute(space)); // TODO: Ensure counters pushed to timeline properly
        console.log("Post Execution: ", state);
        if (timelineView != undefined) {
            timelineView.push(executed_effects); // INTERFACE
            console.log("Timeline: ", timelineView);
        }
        return true;
    }
    return false;
}

var addListeners = function(context, triggerList, eventSignalView) {
    context.canvas.onmousemove = function (event) {
        triggerList.map(t => t(event))
        // eventSignalView.trigger();
    }
    context.canvas.onclick = function (event) {
        triggerList.forEach(t => t(event));
        // eventSignalView.trigger();
    }
}

// viewof tac_board = {
//     // TODO: Easier full reset than refresh?
//     const canvas = DOM.canvas(tac_space.k * size, tac_space.k * size);
//     const context = canvas.getContext("2d");
//     context.canvas.value = context;
//     return context.canvas;
// }

// tac_draw = {
//     tac_eventSignal;
//     const g_space = tac_space; // STATE
//     const g_context = tac_board;
//     const g_eventSignalView = viewof tac_eventSignal;
//     const g_timelineView = viewof tac_timeline; // STATE
//     const g_triggerList = g_space.triggerList;
//     checkConfirmation(g_space, g_timelineView);
//     redraw(g_context, g_space, g_triggerList);
//     addListeners(g_context, g_triggerList, g_eventSignalView);
//     viewof tac_renderCompleteSignal.trigger();
// }

module.exports = {
    redraw: redraw,
    addListeners: addListeners,
    checkConfirmation: checkConfirmation,
    makeCanvas: makeCanvas
}
},{"../view/display":7}],9:[function(require,module,exports){
draw = require('../view/draw');

makeTimeline = function (originalContext, timeline, timelineImages, canvas) {
    // https://stackoverflow.com/questions/3420975/html5-canvas-zooming
    // http://jsfiddle.net/mBzVR/2433/
    canvas.setAttribute("style", "background-color:green")
    const tlen = timeline.length;
    var width = originalContext.canvas.width;
    var height = originalContext.canvas.height;
    var scale = Math.min(0.25, 1.0 / tlen);
    function drawContents(ctx, scale) {
        ctx.scale(scale, scale);
        let temp = timelineImages
            .map((image, i) => {
                const copyContext = draw.makeCanvas(width, height, false).getContext("2d");
                copyContext.putImageData(image, 0, 0);
                return copyContext;
            })
            .map((copied, i) => ctx.drawImage(copied.canvas, width * i, 0));
    }
    canvas.setAttribute("width", (tlen + 1) * width * scale);
    const context = canvas.getContext("2d");
    const imageData = originalContext.getImageData(0, 0, width, height);
    if (timelineImages.length <= tlen) {
        timelineImages.push(imageData);
    } else {
        timelineImages[tlen] = imageData;
    }
    //context.canvas.value = context;
    drawContents(context, scale);
    return context.canvas;
}

function createTimelineController(timelineView, resetFn) {
    let lc = new ListController(timelineView); // INTERFACE
    lc.addEventListener("input", () => {
        resetFn();
    });
    document.body.appendChild(lc);
    return lc;
}

class ListView {
    constructor(initial_list) {
        this._listeners = [];
        this._value = initial_list;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.dispatchEvent({ type: "input", value });
    }

    get length() {
        return this._value.length;
    }

    push(elem) {
        this._value.push(elem);
        this.basicDispatch();
    }

    extend(li) {
        this._value = this._value.concat(li);
        this.basicDispatch();
    }

    pop() {
        this._value.pop();
        this.basicDispatch();
    }

    splice(i) {
        this._value.splice(i);
        this.basicDispatch();
    }

    first() {
        return this._value[0];
    }

    last() {
        return this._value[this._value.length - 1];
    }

    basicDispatch() {
        const _value = this._value;
        this.dispatchEvent({ type: "input", _value });
    }

    addEventListener(type, listener) {
        if (type != "input" || this._listeners.includes(listener)) return;
        this._listeners = [listener].concat(this._listeners);
    }

    removeEventListener(type, listener) {
        if (type != "input") return;
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    dispatchEvent(event) {
        const p = Promise.resolve(event);
        this._listeners.forEach(l => p.then(l));
    }

}

function ListController(list_view) { // list_view: viewof
    // const input = html`<input type=number start=0 min=0 step=1 style="width:auto;">`;
    const input = document.createElement("input")
    input.setAttribute("type", "number");
    input.setAttribute("start", 0);
    input.setAttribute("min", 0);
    input.setAttribute("step", 1);
    input.setAttribute("style", "width:auto");
    list_view.addEventListener("input", event => input.value = list_view.value.length);
    input.addEventListener("input", () => { }); // prevent re-build, which messes up UI
    input.oninput = () => {
        const newVal = input.valueAsNumber;
        for (let i = list_view.value.length; i > newVal; i--) {
            list_view.pop();
        }
    }
    input.value = list_view.value.length;
    return input;
}

class Signal {
    constructor() {
        this._listeners = [];
    }

    trigger() {
        this.dispatchEvent({ type: "input" });
    }
    addEventListener(type, listener) {
        if (type != "input" || this._listeners.includes(listener)) return;
        this._listeners = [listener].concat(this._listeners);
    }
    removeEventListener(type, listener) {
        if (type != "input") return;
        this._listeners = this._listeners.filter(l => l !== listener);
    }
    dispatchEvent(event) {
        const p = Promise.resolve(event);
        this._listeners.forEach(l => p.then(l));
    }
}

module.exports = {
    makeTimeline: makeTimeline,
    createTimelineController: createTimelineController,
    ListView: ListView,
    ListController: ListController
}
},{"../view/draw":8}]},{},[6]);
