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