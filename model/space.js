function argmin(arr) {
    let min = Math.min(...arr);
    return arr.indexOf(min);
}

Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

difference = (set1, set2) => new Set([...set1].filter(num => !set2.has(num)))

union = (set1, set2) => new Set([...set1, ...set2])

class Space {
    constructor(locations, units, k) {
        this.k = k;
        this.locations = locations;
        this.units = units;
    }

    getAdjacent(loc) { // (loc: Location): Location[]
        function isValidLoc(adj) { return adj != undefined && adj.traversable; }
        const x = loc.x;
        const y = loc.y;
        let adjList = []
        let row = this.locations[y - 1];
        if (row != undefined) {
            let adj = row[x];
            if (isValidLoc(adj)) {
                adjList.push(adj);
            }
        }
        row = this.locations[y + 1];
        if (row != undefined) {
            let adj = row[x];
            if (isValidLoc(adj)) {
                adjList.push(adj);
            }
        }

        row = this.locations[y];
        if (row != undefined) {
            let adj = row[x - 1];
            if (isValidLoc(adj)) {
                adjList.push(adj);
            }
            adj = row[x + 1];
            if (isValidLoc(adj)) {
                adjList.push(adj);
            }
        }
        return adjList;
    }

    getReachable(loc, range) { //(loc: Location, range: int): Location[] 
        // TODO: Should this enumerate paths?
        let reached = new Set([loc]);
        let next = new Set();
        let frontier = new Set([...reached]);
        let self = this;
        for (let i = 1; i <= range; i++) {
            next = Array.from(frontier).flatMap(l => self.getAdjacent(l));
            frontier = difference(next, frontier);
            reached = union(reached, next);
        }
        return Array.from(reached);
    }

    getDistance(origin, destination) {
        let dist = 0;
        let prevReachable = [];
        let curReachable = this.getReachable(origin, dist);
        while (curReachable.indexOf(destination) == -1 && prevReachable.length != curReachable.length) {
            dist++;
            prevReachable = curReachable;
            curReachable = this.getReachable(origin, dist);
        }
        return dist;
    }

    getDistanceDirect(origin, destination) {
        return Math.abs(origin.x - destination.x) + Math.abs(origin.y - destination.y);
    }

    getPath(origin, destination) { // TODO: Make efficient and safe.
        if (!origin.traversable || !destination.traversable) { return -1; }
        let dist = this.getDistance(origin, destination);
        if (dist == 0) { return []; }
        let adjList = this.getAdjacent(origin);
        let adjDistances = adjList.map(adj => this.getDistance(adj, destination));
        let nearestAdjIndex = argmin(adjDistances);
        let nearestAdj = adjList[nearestAdjIndex];
        return [nearestAdj].concat(this.getPath(nearestAdj, destination));
    }

    getUnit(location) { // (location: Location) => Unit[]
        return this.units.filter(u => u.loc.x == location.x && u.loc.y == location.y);
    }

    getLocation(location) { // (location: Location) => Unit[]
        return this.locations[location.y][location.x];
    }

    clone() {
        let clonedLocations = this.locations.map(row => row.map(loc => loc.clone())); // TODO: generalize to iterator
        let clonedUnits = this.units.map(u => u.clone());
        return new Space(clonedLocations, clonedUnits, this.k);
    }
}

module.exports = {
    Space: Space
}