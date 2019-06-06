immutable = require('immutable');
ImmutableList = immutable.List;

entity = require("../model/entity");
AbstractEntity = entity.AbstractEntity;
Location = entity.Location;

function co(x, y, z) {
    return new ImmutableList([x, y, z]);
}

function addCo(coord, delta) {
    return co([
        coord[0] + delta[0],
        coord[1] + delta[1],
        coord[2] + delta[2]
    ]);
}

class LocationNode extends AbstractEntity {
    constructor(coord, normal, isTraversable) {
        this.coord = coord;
        this.normal = normal;
        this.isTraversable = isTraversable;
        this.inEdges = [];
        this.outEdges = [];
    }

    _calculateNext(metadata) {
        this.next = this.getNeighbors();
    }

    getNeighbors() {
        this.outEdges.map(edge => edge.to);
    }

    clone() {
        return new LocationNode(this.coord, this.normal, this.isTraversable);
    }
}

class Edge extends AbstractEntity {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}

class Graph extends AbstractEntity {
    constructor(nodeList) {
        this.nodeList = nodeList;
        this.nodeMap = {};
        for (let node of nodeList) { 
            this.nodeMap[node.coord] = node;
        }
    }

    addEdge(from, to) {
        const edge = new Edge(this.nodeMap[from], this.nodeMap[to]);
        this.nodeMap[from].outEdges.push(edge);
        this.nodeMap[to].inEdges.push(edge);
    }

    edgeCount() {
        return this.nodeList.map(n => n.outEdges.length).reduce((a, b) => a + b);
    }
}

class GridGraph extends Graph {
    constructor(size, nh) {
        this.size = size;
        this.nh = nh === undefined ? [[0, -1, 0], [0, 1, 0], [-1, 0, 0], [1, 0, 0]] : nh;
        this.nh = this.nh.map(co => new ImmutableList(co)); // Ensure immutability.
        let gridNodeList = [];
        for (var i = 0; i < size; i += 1) {
            for(var j = 0; j < size; j += 1) {
                let gridLoc = new LocationNode(co(i, j, 0), co(0, 0, 1), True);
                this.nodeList.push(gridLoc);
            }
        }

        super(gridNodeList);
        this.populateGridAdjacencies();
    }

    populateGridAdjacencies() {
        let self = this;
        for (var i = 0; i < size; i += 1) {
            for(var j = 0; j < size; j += 1) {
                let coord = co(i, j, 0); // TODO: Factor into 2D GridGraph helper?
                let neighborCoordList = this.nh
                    .map(delta => addCo(coord, delta))
                    .filter(neighborCoord => isValidCoord(neighborCoord));
                for (let neighborCoord of neighborCoordList) {
                    this.addEdge(coord, neighborCoord);
                }
            }
        }
    }

    isValidCoord(coord) {
        let x = coord[0];
        let y = coord[1];
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
}