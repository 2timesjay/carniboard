const size = 1;

utilities = require("../view/utilitiesthree");
makeRect = utilities.makeRect;
makeCircle = utilities.makeCircle;
makeText = utilities.makeText;
getMouseTarget = utilities.getMouseTarget;
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

    isHit(mouseTarget) {
        return this === mouseTarget;
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
        let context = canvas.getContext("webgl");
        let self = this;
        let trigger = function (e) {
            if (e.type == "click") {
                let mouseTarget = getMouseTarget(canvas, e);
                if (self.isHit(mouseTarget)) {
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
        let context = canvas.getContext("webgl");
        let self = this;
        let trigger = function (e) {
            if (e.type == "mousemove" && !self.select) {
                let mouseTarget = getMouseTarget(canvas, e);
                if (self.isHit(mouseTarget)) {
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
        this.xOffset = this.loc.x * size;
        this.yOffset = this.loc.y * size;
        this.size = size * 0.8;
        this.width = size * 0.8;
        this.height = size * 0.8;
    }

    render(context, clr) {
        if (!this.loc.traversable) { return; }
        makeRect(this, [this.xOffset, this.yOffset, 0], context, this.size, clr, 1.0);
    }

    passiveDisplay(context, clr) {
        const color = clr == undefined ? this.loc.color : clr;
        this.render(context, color);
    }

    basicDisplay(context) {
        this.render(context, 'yellow');
    }

    previewDisplay(context) {
        this.render(context, 'orange');
    }

    selectedDisplay(context) {
        this.render(context, 'red');
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
        this.xOffsetGen = lerp(1.0, this.xOffsetCurrent, this.xOffsetTarget);
    }

    get xOffsetTarget() {
        return this.unit.loc.x * size;
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
        this.yOffsetGen = lerp(1.0, this.yOffsetCurrent, this.yOffsetTarget);
    }

    get yOffsetTarget() {
        return this.unit.loc.y * size;
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
        makeRect(this, [this.xOffset, this.yOffset, 0.5 * size], context, this.size, color, alpha);
    }

    passiveDisplay(context) {
        this.render(context, this.unit.team == 0 ? 'red' : 'blue');
    }

    basicDisplay(context) {
        this.render(context, 'yellow');
    }

    previewDisplay(context) {
        this.render(context, 'orange');
    }

    selectDisplay(context) {
        this.render(context, 'red');
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
        // context.fillStyle = color;
        // context.font = 0.8 * this.size + "px Trebuchet MS";
        // context.fillText(this.action.text, this.xOffset, this.yOffset);
        makeText(this, [this.xOffset, this.yOffset, 1 * size], context, this.action.text, this.size, color, 1);
    }

    basicDisplay(context) {
        this.render(context, 'yellow');
    }

    previewDisplay(context) {
        this.render(context, 'orange');
    }

    selectDisplay(context) {
        this.render(context, 'red');
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
        const loc = this.path.destination;
        console.log("Desination: ", loc);
        let self = this;
        let co = [
            loc.x * self.size,
            loc.y * self.size,
            1.5 * size
        ];
        makeCircle(self, co, context, 0.4 * self.size, 'yellow', 0.75);
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

                let co = [
                    prev_loc.x * self.size + 0.5 * dx * size,
                    prev_loc.y * self.size + 0.5 * dy * size,
                    1.5 * size
                ];
                makeRect(self, co, context, 0.2 * self.size, 'orange', 1.0);
            }
            // Draw circle in middle of grid squares.
            let co = [
                loc.x * self.size,
                loc.y * self.size,
                1.5*size
            ];
            makeCircle(self, co, context, 0.4 * self.size, 'orange', 1.0);
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
                
                let co = [
                    prev_loc.x * self.size + 0.5 * dx * size,
                    prev_loc.y * self.size + 0.5 * dy * size,
                    1.5 * size
                ];
                makeRect(self, co, context, 0.2 * self.size, 'red', 1.0);
            }
            // Draw circle in middle of grid squares.
            let co = [
                loc.x * self.size,
                loc.y * self.size,
                1.5 * size
            ];
            makeCircle(self, co, context, 0.4 * self.size, 'red', 1.0);
        });
    }

    isHit(mouseTarget) {
        return this.path.destination.display.isHit(mouseTarget);
    }
}

class ConfirmationDisplay extends AbstractDisplay {
    constructor(confirmation) {
        super(confirmation);
        this.confirmation = confirmation;
    }

    render(context, clr, lfa) {
        // makeRect([size, 0.5*size, 0], context, 200, "white", 1);
        // context.fillStyle = "black";
        // context.font = 30 + "px Trebuchet MS";
        // context.fillText(this.confirmation.message, 100, 100);
        makeText(this, [this.xOffset, this.yOffset, 1 * size], context, this.confirmation.message, this.size, "black", 1);
    }

    passiveDisplay(context) {
        this.render(context, 'grey');
    }

    basicDisplay(context) {
        this.render(context, 'yellow');
    }

    previewDisplay(context) {
        this.render(context, 'orange');
    }

    selectDisplay(context) {
        this.render(context, 'red');
    }

}

module.exports = {
    Unit: UnitDisplay,
    Location: LocationDisplay,
    Path: PathDisplay,
    MoveAction: ActionDisplay,
    AttackAction: ActionDisplay,
    ReadyCounterAction: ActionDisplay,
    Confirmation: ConfirmationDisplay
}