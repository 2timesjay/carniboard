class ListView {
    constructor(initial_list) {
        this._listeners = [];
        this._value = initial_list;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.dispatchEvent({ type: "input", value });
    }

    get length() {
        return this._value.length;
    }

    push(elem) {
        this._value.push(elem);
        this.basicDispatch();
    }

    extend(li) {
        this._value = this._value.concat(li);
        this.basicDispatch();
    }

    pop() {
        this._value.pop();
        this.basicDispatch();
    }

    splice(i) {
        this._value.splice(i);
        this.basicDispatch();
    }

    first() {
        return this._value[0];
    }

    last() {
        return this._value[this._value.length - 1];
    }

    basicDispatch() {
        const _value = this._value;
        this.dispatchEvent({ type: "input", _value });
    }

    addEventListener(type, listener) {
        if (type != "input" || this._listeners.includes(listener)) return;
        this._listeners = [listener].concat(this._listeners);
    }

    removeEventListener(type, listener) {
        if (type != "input") return;
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    dispatchEvent(event) {
        const p = Promise.resolve(event);
        this._listeners.forEach(l => p.then(l));
    }

}

class Signal {
    constructor() {
        this._listeners = [];
    }

    trigger() {
        this.dispatchEvent({ type: "input" });
    }
    addEventListener(type, listener) {
        if (type != "input" || this._listeners.includes(listener)) return;
        this._listeners = [listener].concat(this._listeners);
    }
    removeEventListener(type, listener) {
        if (type != "input") return;
        this._listeners = this._listeners.filter(l => l !== listener);
    }
    dispatchEvent(event) {
        const p = Promise.resolve(event);
        this._listeners.forEach(l => p.then(l));
    }
}

module.exports = {
    Signal: Signal,
    ListView: ListView
}