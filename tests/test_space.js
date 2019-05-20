var test = require('tape');
var Location = require('../model/entity').Location;
var Unit = require('../model/entity').Unit;
var Space = require('../model/space').Space;

locations = [
    [1, 0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [1, 1, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1],
].map(
    (row, y) => row.map(
        (loc, x) => new Location(x, y, loc)
    ));

units = [
    { 'range': 3, 'loc': [0, 0], 'name': 'anxia', 'team': 0 },
    { 'range': 3, 'loc': [3, 1], 'name': 'boxer', 'team': 1 },
    { 'range': 3, 'loc': [3, 2], 'name': 'caleb', 'team': 0 },
    { 'range': 4, 'loc': [5, 5], 'name': 'deep', 'team': 1 }
].map(u => new Unit(u.name, locations[u.loc[1]][u.loc[0]], u.team, u));

space = new Space(locations, units);

test('getAdjacent', function (t) {
    t.plan(2);

    t.deepEquals(
        [locations[1][0]],
        space.getAdjacent(locations[0][0])
    );
    
    t.deepEquals(
        new Set([locations[3][1], locations[3][3], locations[2][2]]),
        new Set(space.getAdjacent(locations[3][2])),
    )
});

test('getAdjacentCustomNeighborhood', function (t) {
    t.plan(2);

    t.deepEquals(
        [locations[1][0]],
        space.getAdjacent(locations[0][0])
    );

    t.deepEquals(
        new Set([locations[3][1], locations[3][3], locations[2][2]]),
        new Set(space.getAdjacent(locations[3][2])),
    )
});

test('getReachable', function (t) {
    t.plan(4);
    t.deepEquals(
        [locations[0][0]],
        space.getReachable(locations[0][0], 0),
        "Zero range reachable"
    ) // Should be (0, 0)

    t.deepEquals(
        [locations[0][0], locations[1][0]],
        space.getReachable(locations[0][0], 1),
        "One range reachable"
    ) // Should be (0, 0), (0, 1)
    t.deepEquals(
        new Set([locations[0][0], locations[1][0], locations[2][0], locations[1][1], locations[2][1]]),
        new Set(space.getReachable(locations[0][0], 3)),
        "Three range reachable"
    ) // Should be (0, 0), (0, 1), (0,2), (1, 1), (1,2)
    t.equals(
        11,
        space.getReachable(locations[2][3], 3).length,
        "Three range reachable, start (2,3)"
    ) // 11 Locs
});

test('getPath', function (t) {
    t.plan(3);
    t.deepEquals(
        [],
        space.getPath(locations[2][3], locations[2][3]),
        "Path (2, 3) to (2, 3)"
    )

    t.deepEquals(
        [locations[4][1], locations[5][1], locations[5][2]],
        space.getPath(locations[4][0], locations[5][2]),
        "Path (4, 0) to (5, 2)"
    )

    t.equals(
        10,
        space.getPath(locations[0][0], locations[5][5]).length,
        "Path (0, 0) to (5, 5)"
    )
});