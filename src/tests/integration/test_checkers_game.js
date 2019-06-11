var test = require('tape');
var Selectable = require('../../controller/selectable.js').Selectable;
var TreeSelectable = require('../../controller/selectable.js').TreeSelectable;
var GridGraph = require('../../model/graph.js').GridGraph;
var CheckersGraph = require('../../model/graph.js').CheckersGraph;
var co = require('../../model/graph.js').co;
var Unit = require('../../model/entity.js').Unit;
var CheckersPiece = require('../../model/entity.js').CheckersPiece;
var CheckersMoveAction = require('../../model/entity.js').CheckersMoveAction;
var makeCheckersWithGraph = require('../../model/construction.js').makeCheckersWithGraph;

test('testCreateCheckersBoard', function (t) {
    t.plan(3);
    let stack = makeCheckersWithGraph();
    t.equals(stack._stack.length, 1);
    let state = stack.state;
    let space = state.space;
    t.equals(space.nodeList.length, 64);
    t.equals(space.nodeList.map(loc => loc.units).filter(u => u.length == 1).length, 16);
});