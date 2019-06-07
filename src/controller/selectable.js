immutable = require('immutable');
ImmutableList = immutable.List;

class Selectable {
    constructor(entity, isConfirmable) {
        this.entity = entity;
        this.next = undefined;
        this.isConfirmable = isConfirmable;
    }

    getNext(input) { 
        if (this.next == undefined){
            this._calculateNext();
        }
        return this.next;
    }

    _calculateNext() {
        this.next = [];
    }
}

class TreeSelectable extends Selectable {
    /*
     * Handles selection for tree-like entities.
     *
     * On initial select, shows top-priority path for each group.
     * On subsequent selections, return TreeSelectable with end of those paths as root.
     */
    constructor(entity, isConfirmable, history, groupByFn, priorityFn) {
        super(entity, isConfirmable);
        this.groupByFn = groupByFn;
        this.priorityFn = priorityFn;
        this.history = history;
    }

    _getAllPaths() {
        const EXPLORATION_MARKER = 0; // TODO: Make some kind of marker entity?
        var pathsByGroup = new Map();
        var pathStack = [];
        var searchStack = [this.entity];
        while (searchStack.length > 0) {
            let root = searchStack.pop();
            if (root == EXPLORATION_MARKER) {
                pathStack.pop();
            }
            else {
                pathStack.push(root);
                searchStack.push(EXPLORATION_MARKER);
                if (root.childList.length > 0) {            
                    searchStack.push(...root.childList);
                }

                // Update Map from groupBy key to paths if this new path has highest priority in group.
                const path = new ImmutableList(pathStack);
                const groupKey = this.groupByFn(path);
                const oldPathAtGroupKey = pathsByGroup.get(groupKey);
                if (oldPathAtGroupKey == undefined) { // Add path at key if no existing path.
                    pathsByGroup[groupKey] = path;
                } else { // Add path at key if of higher priority.
                    let oldPathPriority = this.priorityFn(oldPathAtGroupKey);
                    let newPathPriority = this.priorityFn(path);
                    if (newPathPriority > oldPathPriority) {
                        pathsByGroup[groupKey] = path;
                    } 
                }
            }
        }
        return pathsByGroup;
    }

    _calculateNext() {
        this.next = _getAllPaths().values;
    }

    getNext(input) { // TODO: this is kind of ill-defined. Why does this take input when all other getNexts don't?
        let newRoot = input;
        return new TreeSelectable(newRoot, True, input, this.groupByFn, this.priorityFn);
    }
}

class CheckersMoveSelectable extends TreeSelectable {
    constructor(entity, isConfirmable, history) {
        let groupByFn = edgeList => edgeList[edgeList.length - 1].to;
        let priorityFn = edgeList => -1 * edgeList.length;
        super(entity, isConfirmable, history, groupByFn, priorityFn);
    }

    getNext(input) { 
        let newRoot = input;
        return new CheckersMoveSelectable(newRoot, True, input);
    }
}

module.exports = {
    Selectable: Selectable
};