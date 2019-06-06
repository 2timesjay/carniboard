var test = require('tape');
var GridGraph = require('../../model/graph.js').GridGraph;
var CheckersGraph = require('../../model/graph.js').CheckersGraph;
var co = require('../../model/graph.js').co;

test('testGridGraph', function (t) {
    t.plan(5);
    
    let grid = new GridGraph(4);
    t.equals(grid.nodeList.length, 16, "Constructing 4x4 grid creates 16 nodes.");

    let middleCo = co(1, 1, 0);
    middleNode = grid.nodeMap[middleCo];
    t.notEquals(middleNode, undefined, "loc 1,1 exists in node map");
    t.equals(middleNode.getNeighbors().length, 4, "loc 1,1 has 4 neighbors");
    
    let cornerCo = co(3, 3, 0);
    cornerNode = grid.nodeMap[cornerCo];
    t.notEquals(cornerNode, undefined, "loc 3,3 exists in node map");
    t.equals(cornerNode.getNeighbors().length, 2, "loc 3,3 has 2 neighbors");

});

test('testCheckersGraph', function (t) {
    t.plan(7);
    
    let grid = new CheckersGraph();
    t.equals(grid.nodeList.length, 64);

    let middleCo = co(2, 2, 0);
    middleNode = grid.nodeMap[middleCo];
    t.notEquals(middleNode, undefined, "loc 2,2 exists in node map");
    t.equals(middleNode.getNeighbors().length, 8, "loc 2,2 has 8 neighbors");

    let nearEdgeCo = co(5, 1, 0);
    nearEdgeNode = grid.nodeMap[nearEdgeCo];
    t.notEquals(nearEdgeNode, undefined, "loc 3,3 exists in node map");
    t.equals(nearEdgeNode.getNeighbors().length, 6, "loc 5,1 has 6 neighbors");
    
    let cornerCo = co(7, 7, 0);
    cornerNode = grid.nodeMap[cornerCo];
    t.notEquals(cornerNode, undefined, "loc 7,7 exists in node map");
    t.equals(cornerNode.getNeighbors().length, 2, "loc 7,7 has 2 neighbors");
});