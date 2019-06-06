utilities = require("../utilities/utilities")
intersection = utilities.intersection;

entity = require('./entity')
Unit = entity.Unit
CheckerPiece = entity.CheckerPiece
Location = entity.Location
TicTacToeControlQueue = entity.TicTacToeControlQueue
ConnectFourControlQueue = entity.ConnectFourControlQueue
BasicTacticsControlQueue = entity.BasicTacticsControlQueue
Confirmation = entity.Confirmation

effect = require('./effect')
AddUnitEffect = effect.AddUnitEffect
EndTurnEffect = effect.EndTurnEffect

Space = require('./space').Space
State = require('./state').State

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

    gameEndConfirmation = function (spc) {
        let t0 = spc.units.filter(u => u.team == 0);
        let t1 = spc.units.filter(u => u.team == 1);
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
    scoreFn = function (state) {
        let spc = state.space;
        let curTeam = spc.units.filter(u => u.team == state.team);
        let otherTeam = spc.units.filter(u => u.team == 1 - state.team);
        if (threeInARow(curTeam)) { return 1;}
        else if (threeInARow(otherTeam)) {return -1;}
        else { return 0; }
    }
    stack = [new TicTacToeControlQueue()];
    state = new State(space, stack, gameEndConfirmation, digestFnGetter, scoreFn);
    return state;
}

makeConnectFour = function () {
    let locations = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1]
    ].map(
        (row, y) => row.map(
            (loc, x) => new Location(x, y, loc)
        ));
    let units = [];
    let space = new Space(locations, units, 7);

    function fourInARow(team) {
        function hash(u) {
            return u.loc.y * 7 + u.loc.x;
        }
        let hashes = new Set(team.map(u => hash(u)));
        // Horizontal
        function horizontal(u) {
            if (u.loc.x >= 4) {
                return false;
            }
            let curHash = hash(u)
            let partial = intersection(
                new Set([curHash, curHash + 1, curHash + 2, curHash + 3]),
                hashes)
            return partial.size == 4;
        }
        function vertical(u) {
            if (u.loc.y >= 3) {
                return false;
            }
            let curHash = hash(u)
            let partial = intersection(
                new Set([curHash, curHash + 7, curHash + 14, curHash + 21]),
                hashes)
            return partial.size == 4;
        }
        function diagDown(u) {
            if (u.loc.y >= 3 || u.loc.x >= 4) {
                return false;
            }
            let curHash = hash(u)
            let partial = intersection(
                new Set([curHash, curHash + 8, curHash + 16, curHash + 24]),
                hashes)
            return partial.size == 4;
        }
        function diagUp(u) {
            if (u.loc.y >= 3 || u.loc.x < 3) {
                return false;
            }
            let curHash = hash(u)
            let partial = intersection(
                new Set([curHash, curHash + 6, curHash + 12, curHash + 18]),
                hashes)
            return partial.size == 4;
        }
        return team.some(u => horizontal(u) || vertical(u) || diagDown(u) || diagUp(u));
    }

    gameEndConfirmation = function (spc) {
        let t0 = spc.units.filter(u => u.team == 0);
        let t1 = spc.units.filter(u => u.team == 1);
        
        let over = (spc.units.length == 42) || fourInARow(t0) || fourInARow(t1);
        if (over) {
            return [new Confirmation(undefined, "GAME OVER", true)];
        } else {
            return [];
        }
    };
    digestFnGetter = function (stk) {
        function drop(loc) {
            console.log("Drop from: ", loc);
            let occupied = new Set(units.map(u => u.loc));
            let x = loc.x;
            for (let y = 0; y < 6; y++) {
                if (y == 5) { 
                    return loc; 
                }
                let next = space.locations[y + 1][x];
                if (occupied.has(next)) {
                    return loc;
                } else {
                    loc = next;
                }
            }
            console.log("Drop to: ", loc);
            return loc;
        }
        return function (stk) {
            let location = stk[1];
            let drop_loc = drop(location);
            return [new AddUnitEffect(drop_loc), new EndTurnEffect()];
        }; // TODO: Add unit
    }

    scoreFn = function (state) {
        let spc = state.space;
        let curTeam = spc.units.filter(u => u.team == state.team);
        let otherTeam = spc.units.filter(u => u.team == 1 - state.team);
        if (fourInARow(curTeam)) { return 1; }
        else if (fourInARow(otherTeam)) { return -1; }
        else { return 0; }
    }

    stack = [new ConnectFourControlQueue()];
    state = new State(space, stack, gameEndConfirmation, digestFnGetter);
    return state;
}

makeBasicTactics = function() {
    let locations = [
        [1, 0, 1, 1, 1, 0, 0, 0],
        [1, 1, 0, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 0, 0, 1, 1],
        [0, 1, 1, 1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 1, 1],
    ].map(
        (row, y) => row.map(
            (loc, x) => new Location(x, y, loc)
        ));
    let units = [
        { 'range': 3, 'loc': [0, 0], 'name': 'anxia', 'team': 0 },
        { 'range': 3, 'loc': [3, 1], 'name': 'boxer', 'team': 1 },
        { 'range': 3, 'loc': [3, 2], 'name': 'caleb', 'team': 0 },
        { 'range': 4, 'loc': [5, 5], 'name': 'deepa', 'team': 1 }
    ].map(u => new Unit(u.name, locations[u.loc[1]][u.loc[0]], u.team, u));
    console.log("RESET SPACE");
    let space = new Space(locations, units, 8);
    let teamDead = function (team) {
        let aliveUnits = team.filter(u => u.isAlive());
        return aliveUnits.length == 0;
    };
    gameEndConfirmation = function (spc) {
        let t0 = spc.units.filter(u => u.team == 0);
        let t1 = spc.units.filter(u => u.team == 1);
        if (teamDead(t0) || teamDead(t1)) {
            return [new Confirmation(undefined, "GAME OVER", true)];
        } else {
            return [];
        };
    };
    digestFnGetter = function (stack) { // stack => (stack => Effect[])
        let action = stack[2];
        return action.digestFn;
    };

    scoreFn = function (state) {
        let spc = state.space;
        let curTeam = spc.units.filter(u => u.team == state.team);
        let otherTeam = spc.units.filter(u => u.team == 1 - state.team);
        if (teamDead(otherTeam)) { return 1; }
        else if (teamDead(curTeam)) { return -1; }
        else { return 0; }
    }
    stack = [new BasicTacticsControlQueue()];
    state = new State(space, stack, gameEndConfirmation, digestFnGetter);
    return state;
}

makeCheckers = function () {
    let locations = [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
    ].map(
        (row, y) => row.map(
            (loc, x) => new Location(x, y, loc)
        ));
    let units = [{
            'loc': [0, 0],
            'name': 'red1',
            'team': 0
        },
        {
            'loc': [1, 1],
            'name': 'red2',
            'team': 0
        },
        {
            'loc': [1, 3],
            'name': 'black1',
            'team': 1
        },
        {
            'loc': [2, 2],
            'name': 'black2',
            'team': 1
        }
    ].map(u => new CheckerPiece(u.name, locations[u.loc[1]][u.loc[0]], u.team));
    
    let space = new Space(locations, units, 8);
    let teamDead = function (team) {
        let aliveUnits = team.filter(u => u.isAlive());
        return aliveUnits.length == 0;
    };

    gameEndConfirmation = function (spc) {
        let t0 = spc.units.filter(u => u.team == 0);
        let t1 = spc.units.filter(u => u.team == 1);
        if (teamDead(t0) || teamDead(t1)) {
            return [new Confirmation(undefined, "GAME OVER", true)];
        } else {
            return [];
        };
    };

    digestFnGetter = function (stack) { // stack => (stack => Effect[])
        let action = stack[2];
        return action.digestFn;
    };

    scoreFn = function (state) {
        let spc = state.space;
        let curTeam = spc.units.filter(u => u.team == state.team);
        let otherTeam = spc.units.filter(u => u.team == 1 - state.team);
        if (teamDead(otherTeam)) {
            return 1;
        } else if (teamDead(curTeam)) {
            return -1;
        } else {
            return 0;
        }
    };
    
    stack = [new BasicTacticsControlQueue()];
    state = new State(space, stack, gameEndConfirmation, digestFnGetter);
    return state;
}

module.exports = {
    makeTicTacToe: makeTicTacToe,
    makeConnectFour: makeConnectFour,
    makeBasicTactics: makeBasicTactics,
    makeCheckers: makeCheckers
}