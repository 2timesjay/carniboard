class SelectionStack {
    constructor(stack /* : Selectable[] */) { 
        this._stack = stack;
    }

    peek() /* : Selectable */ {
        let last_index /* : Number */= this._stack.length - 1;
        return this._stack[last_index]
    }

    getNext() /* : Selectable[] */ {
        // Get list of selectables representing next options.
        return this.peek().getNext(); 
    }
    
    choose(selection /* : Selectable */) { 
        // Make choice by pushing to stack.
        this._stack.push(selection);
    }
    
    unchoose() { 
        // Pop the last selection.
        this.stack().pop();
        // TODO: Add subSelection logic, unchoosing whole paths for instance.
        // while (this.peek().isSubSelection()){
        //     this.stack().pop();
        // }
    }

    getMap() /* :Map<String, Selectable[]> */{
        let m = new Map();
        this._stack.forEach(elem => {
            let label = elem.label;
            let labeled_list = map.get(label);
            if (!labeled_list) {
                map.set(label, [elem]);
            } else {
                collection.push(item);
            }
        })
        
    }

    clone() /* : SelectionStack */ {
    // TODO: Cloning relies on effect implementation matching distinct objects
        let _stackClone = this._stack.map(elem => elem.clone());
        return new this.constructor(_stackClone);
    }
}

module.exports = {
    SelectionStack: SelectionStack
}