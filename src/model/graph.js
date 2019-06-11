immutable = require('immutable');
ImmutableList = immutable.List;

entity = require("./entity");
AbstractEntity = entity.AbstractEntity;
Location = entity.Location;

function co(x, y, z) {
    return new ImmutableList([x, y, z]);
}

function addCo(coord, oCoord) {
    let resultCoord = co(
        coord.get(0) + oCoord.get(0),
        coord.get(1) + oCoord.get(1),
        coord.get(2) + oCoord.get(2)
    );
    return resultCoord;
}

function subCo(coord, oCoord) {
    let resultCoord = co(
        coord.get(0) - oCoord.get(0),
        coord.get(1) - oCoord.get(1),
        coord.get(2) - oCoord.get(2)
    );
    return resultCoord;
}

function jumpedCo(coord, oCoord) {
    let resultCoord = co(
        (coord.get(0) + oCoord.get(0)) / 2,
        (coord.get(1) + oCoord.get(1)) / 2,
        (coord.get(2) + oCoord.get(2)) / 2
    );
    return resultCoord;
}

class LocationNode extends AbstractEntity {
    constructor(coord, normal, isTraversable) {
        super();
        this.coord = coord;
        this.normal = normal;
        this.isTraversable = isTraversable;
        this.inEdges = [];
        this.outEdges = [];
        this.units = [];
    }

    getNeighbors() {
        return this.outEdges.map(edge => edge.to);
    }

    addUnit(u){
        if (!this.containsUnit(u)) {
            this.units.push(u);
        }
    }

    removeUnit(u) {
        if (this.containsUnit(u)) {
            let removed = this.units.splice(this.units.indexOf(u))[0];
            return removed;
        } else {
            return null;
        }
    }

    clearUnits(u) {
        let cleared = this.units.splice(0);
        return cleared;
    }

    containsUnit(u) {
        return this.units.indexOf(u) != -1;
    }

    clone() {
        return new LocationNode(this.coord, this.normal, this.isTraversable);
    }
}

class Edge extends AbstractEntity {
    constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
    }

    isTraversable(stack) {
        return this.from.isTraversable && this.to.isTraversable;
    }

    getNext(stack) {
        
    }

    _calculateNext(stack) {
        return this.to.outEdges.filter(edge => edge.isTraversable(stack));
    }
}

class CheckersEdge extends Edge {
    constructor(from, to) {
        super(from, to);
        this.delta = subCo(to, from);
        let isJump = ((Math.abs(this.delta.get(1)) == 2) && 
                      (Math.abs(this.delta.get(0)) == 2));
        this.jumped = isJump ? jumpedCo(to, from) : null;
    }

    isTraversable(stack) {
        prevEdgeList = stack.path;
        let noPrevNonJumps = prevEdgeList.every(edge => edge.jumped !== null);
        let noDuplicateJumps = prevEdgeList.every(edge => edge.jumped != self.jumped);
        // let mustJumpEnemies = self.jumped
        return noPrevNonJumps && noDuplicateJumps;
    }
}

class Graph extends AbstractEntity {
    constructor(nodeList) {
        super();
        this.nodeList = nodeList;
        this.nodeMap = {};
        this.updateNodeMap();
    }

    updateNodeMap(){
        for (let node of this.nodeList) { 
            this.nodeMap[node.coord] = node;
        }
    }

    addEdge(from, to) {
        const edge = this.constructEdge(from, to);
        this.nodeMap[from].outEdges.push(edge);
        this.nodeMap[to].inEdges.push(edge);
    }
    
    constructEdge(from, to) {
        return new Edge(from, to);
    }

    edgeCount() {
        return this.nodeList.map(n => n.outEdges.length).reduce((a, b) => a + b);
    }

    addUnit(u, coord) {
        let loc = this.nodeMap[coord];
        loc.addUnit(u);
        u.loc = loc;
    }

    removeUnitAtCoord(coord) {
        let loc = this.nodeMap[coord];
        let cleared = loc.clearUnits();
        cleared.forEach(u => u.loc = null);
    }
}

class GridGraph extends Graph {
    constructor(size, nh) {
        super([]);
        this.size = size;
        for (var i = 0; i < size; i += 1) {
            for(var j = 0; j < size; j += 1) {
                let gridLoc = new LocationNode(co(i, j, 0), co(0, 0, 1), true);
                this.nodeList.push(gridLoc);
            }
        }
        this.updateNodeMap();
        
        // Add edges to neighborhood locations. 4-way square Grid by default.
        nh = nh === undefined ? [[0, -1, 0], [0, 1, 0], [-1, 0, 0], [1, 0, 0]] : nh;
        nh = nh.map(coord => co(...coord)); // transform to coordinates
        this.nh = nh;
        this.populateGridAdjacencies(nh);
    }

    populateGridAdjacencies() {
        let self = this;
        for (var i = 0; i < this.size; i += 1) {
            for(var j = 0; j < this.size; j += 1) {
                let coord = co(i, j, 0); // TODO: Factor into 2D GridGraph helper?
                let neighborCoordList = self.nh
                    .map(delta => addCo(coord, delta))
                    .filter(neighborCoord => self.isValidCoord(neighborCoord));
                for (let neighborCoord of neighborCoordList) {
                    self.addEdge(coord, neighborCoord);
                }
            }
        }
    }

    isValidCoord(coord) {
        let x = coord.get(0);
        let y = coord.get(1);
        let isValid = x >= 0 && x < this.size && y >= 0 && y < this.size;
        return isValid;
    }
}

class CheckersGraph extends GridGraph {
    constructor() {
        let moveNh = [[-1, -1, 0], [-1, 1, 0], [1, -1, 0], [1, 1, 0]];
        let jumpNh = [[-2, -2, 0], [-2, 2, 0], [2, -2, 0], [2, 2, 0]];
        super(8, moveNh.concat(jumpNh));
    }
    
    constructEdge(from, to) {
        return new CheckersEdge(from, to);
    }
}

module.exports = {
    Graph: Graph,
    GridGraph: GridGraph,
    CheckersGraph: CheckersGraph,
    co: co
};