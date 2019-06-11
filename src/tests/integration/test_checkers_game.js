var test = require('tape');
var Selectable = require('../../controller/selectable.js').Selectable;
var TreeSelectable = require('../../controller/selectable.js').TreeSelectable;
var GridGraph = require('../../model/graph.js').GridGraph;
var CheckersGraph = require('../../model/graph.js').CheckersGraph;
var co = require('../../model/graph.js').co;
var Unit = require('../../model/entity.js').Unit;
var CheckersPiece = require('../../model/entity.js').CheckersPiece;
var CheckersMoveAction = require('../../model/entity.js').CheckersMoveAction;
var CheckersControlQueue = require('../../model/entity.js').CheckersControlQueue;
var makeCheckersWithGraph = require('../../model/construction.js').makeCheckersWithGraph;

test('testCreateCheckersBoard', function (t) {
    let stack = makeCheckersWithGraph();
    let state = stack.state;
    let space = state.space;

    t.plan(4);

    t.equals(stack._stack.length, 1);
    
    t.equals(space.nodeList.length, 64);
    
    let actualUnits = space.nodeList.map(loc => loc.units).filter(u => u.length == 1).length;
    t.equals(actualUnits, 16, "16 pieces placed");

    let stackTopEntity = stack.peek().entity;
    t.true(
        stackTopEntity instanceof CheckersControlQueue, 
        "Stack top is instance of CheckersControlQueue"
    );
});

test('testPlayCheckers', function (t) {
    let stack = makeCheckersWithGraph();
    let state = stack.state;
    let space = state.space;
    
    t.plan(1);

    let unitOptions = stack.getNext();
    t.equals(unitOptions.length, 8);
});