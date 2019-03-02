display = require('../view/display')

var makeCanvas = function (width, height, attach) {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    if (attach) {
        document.body.appendChild(canvas);
    }
    return canvas;
}
var addDisplay = function(entity){
    var className = entity.constructor.name;
    var displayConstructor = display[className];
    if (displayConstructor == undefined){ return undefined; }
    else { return new displayConstructor(entity); }
}

var tryAttachDisplay = function(entity) {
    if (entity.display != undefined) { return; }
    else {
        var display = addDisplay(entity);
        entity.display = display;
    }
}

var redraw = function(context, state, triggerList, size) {
    let space = state.space;
    let stack = state.stack;
    let k = space.k;
    context.clearRect(0, 0, k * size, k * size);
    const canvas = context.canvas;

    triggerList.splice(0, triggerList.length);
    function showSpace(space) {
        let locs = space.locations;
        for (let x = 0; x < locs.length; x++) {
            let row = locs[x];
            for (let y = 0; y < row.length; y++) {
                let loc = row[y];
                tryAttachDisplay(loc);
                loc.display.passiveDisplay(context);
            }
        }
        space.units.forEach(u => {
            tryAttachDisplay(u); 
            u.display.passiveDisplay(context); 
        });
    }
    function showElement(elem, listen_elem, show_children, listen_children) {
        tryAttachDisplay(elem);
        if (elem.display != undefined) {
            elem.display.display(context);
            if (listen_elem) {
                triggerList.unshift(elem.display.previewListener(canvas));
                triggerList.unshift(elem.display.selectListener(canvas, stack));
            }
        }
        if (show_children) {
            let selection = elem.getNextSelection(space);
            for (let i = 0; i < selection.length; i++) {
                let s = selection[i];
                tryAttachDisplay(s);
                s.display.display(context);
                if (listen_children) {
                    triggerList.unshift(s.display.previewListener(canvas));
                    triggerList.unshift(s.display.selectListener(canvas, stack));
                }
            }
        }
    }
    function showInputStack(stack) {
        let topLayer = stack.length - 1;
        // For every element in the inputStack display if selected. 
        // Listen to deselect and only deselect for all or just the top element in the stack.
        // Add preview and select listeners for nextSel only.
        for (let layer = 0; layer < stack.length; layer++) {
            let elem = stack[layer];
            showElement(elem, false, false, false);
            if (layer == topLayer) {
                showElement(elem, true, true, true);
            }
        }
    }
    showSpace(space, stack);
    showInputStack(stack);
}

var checkConfirmation = function (state, timelineView) {
    let space = state.space
    let stack = state.stack;
    let digestFnGetter = state.digestFnGetter;
    let topSel = stack[stack.length - 1].getNextSelection(space);
    if (topSel.length > 0 && topSel[0].constructor.name == "Confirmation" && !topSel[0].isEnd) {
        console.log("CONFIRMED: ", stack);
        let digestFn = digestFnGetter(stack);
        let effects = digestFn(stack);
        while (stack.length > 1) {
            let top = stack[stack.length - 1];
            top.display._deselect(stack);
        }
        executed_effects = execute(effects, space);
         // TODO: Ensure counters pushed to timeline properly
        console.log("Post Execution: ", state);
        if (timelineView != undefined) {
            timelineView.push(executed_effects); // INTERFACE
            console.log("Timeline: ", timelineView);
        }
        return true;
    }
    return false;
}

var execute = function(effects, space) {
    var effectToPromise = function(effect) {
        return () => {
            let effectPromise = new Promise((resolve, reject) => {
                let duration = effect.animationDuration();
                let result = effect.execute(space);
                let executeAndAnimate = setTimeout(() => {
                    clearTimeout(executeAndAnimate);
                    resolve(result);
                    console.log("PROMISED: ", duration, effect);
                }, duration)
            })
            return effectPromise;
        }
    }

    var executionPromise = effects.reduce((prev, cur) => prev.then(effectToPromise(cur)), Promise.resolve());
    //executionPromise.then();
    return effects;
}

var addListeners = function(context, triggerList) {
    context.canvas.onmousemove = function (event) {
        triggerList.map(t => t(event))
    }
    context.canvas.onclick = function (event) {
        triggerList.forEach(t => t(event));
    }
}

// viewof tac_board = {
//     // TODO: Easier full reset than refresh?
//     const canvas = DOM.canvas(tac_space.k * size, tac_space.k * size);
//     const context = canvas.getContext("2d");
//     context.canvas.value = context;
//     return context.canvas;
// }

// tac_draw = {
//     tac_eventSignal;
//     const g_space = tac_space; // STATE
//     const g_context = tac_board;
//     const g_eventSignalView = viewof tac_eventSignal;
//     const g_timelineView = viewof tac_timeline; // STATE
//     const g_triggerList = g_space.triggerList;
//     checkConfirmation(g_space, g_timelineView);
//     redraw(g_context, g_space, g_triggerList);
//     addListeners(g_context, g_triggerList, g_eventSignalView);
//     viewof tac_renderCompleteSignal.trigger();
// }

module.exports = {
    redraw: redraw,
    addListeners: addListeners,
    checkConfirmation: checkConfirmation,
    makeCanvas: makeCanvas
}