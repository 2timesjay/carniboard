class Selectable {
    /* 
     * Wrapper for entities turning them into selectables.
     *
     * Selectables generate subsequent selectables and contain additional metadata.
     * 
     * @param entity - entity being wrapped as a Selectable.
     * @param label  - label used to identify this Selectable.
     * @param
     */
    constructor(entity/* : AbstractEntity */, label) { 
        this.entity = entity;
        this.label = label || null;
    }


    getNext() /* : Selectable[] */ {
        return this.entity.next.map(e => Selectable(e), e.constructor.name);
    }


    clone() /* : Selectable */ { 
    // TODO: Cloning relies on effect implementation matching distinct objects
        let entityClone = this.entity.clone();
        return new this.constructor(entityClone, this.label);
    }
}

module.exports = {
    Selectable: Selectable
};