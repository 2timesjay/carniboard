const size = 100;

utilities = require("../view/utilities");
makeRect = utilities.makeRect;
getMousePos = utilities.getMousePos;
makeCircle = utilities.makeCircle;
lerp = utilities.lerp;

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
            if (e.type == "mousemove" && !self.select) {
                let mousePos = getMousePos(canvas, e);
                if (self.isHit(mousePos)) {
                    self.preview = true;
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

        this.xOffsetCurrent = this.xOffsetTarget;
        this.xGenReset(); 
        this.yOffsetCurrent = this.yOffsetTarget;
        this.yGenReset(); 
    }

    xGenReset() {
        this.xOffsetGen = lerp(100, this.xOffsetCurrent, this.xOffsetTarget);
    }

    get xOffsetTarget() {
        return this.unit.loc.x * size + 0.2 * size;
    }

    get xOffset() {
        let next = this.xOffsetGen.next();
        if (next.done) {
            this.xGenReset();
            return this.xOffsetCurrent;
        }
        else {
            this.xOffsetCurrent = next.value
            return this.xOffsetCurrent;
        }
    }

    yGenReset() {
        this.yOffsetGen = lerp(100, this.yOffsetCurrent, this.yOffsetTarget);
    }

    get yOffsetTarget() {
        return this.unit.loc.y * size + 0.2 * size
    }

    get yOffset() {
        let next = this.yOffsetGen.next();
        if (next.done) {
            this.yGenReset();
            return this.yOffsetCurrent;
        }
        else {
            this.yOffsetCurrent = next.value
            return this.yOffsetCurrent;
        }
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
        var inYBounds = mousePos.y >= this.yOffset && mousePos.y < this.yOffset + this.size;
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
    CheckerPiece: UnitDisplay, // TODO: Many-to-one display cleanup
    Unit: UnitDisplay,
    Location: LocationDisplay,
    Path: PathDisplay,
    CheckersPath: PathDisplay,
    CheckersMoveAction: ActionDisplay,
    MoveAction: ActionDisplay,
    AttackAction: ActionDisplay,
    ReadyCounterAction: ActionDisplay,
    Confirmation: ConfirmationDisplay
}