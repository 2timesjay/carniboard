THREE = require('three');
OrbitControls = require('three-orbit-controls')(THREE);
display = require('../view/displaythree')
utilities = require('../view/utilitiesthree')

var container;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED;
var radius = 100, theta = 0;
var WIDTH = 800, HEIGHT = 800;

var _getCoords = function () {
    return (
        [
            [0, 0, 0], [0, 1, 0], [0, 2, 0],
            [1, 0, 0], [1, 1, 0],
            [2, 0, 0], [2, 1, 0], [2, 2, 0],

            [0, 0, 1], [0, 2, 1],
            [1, 0, 1], [1, 1, 1],
            [2, 1, 1],


            [1, 0, 2]
        ]
    )
}

var _getScene = function () {
    const material = new THREE.MeshNormalMaterial();
    let scene = new THREE.Scene();

    scene.background = new THREE.Color(0xf0f0f0);
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    var light = new THREE.DirectionalLight(0xffffff, 0.4);
    light.position.set(-1, -1, -1).normalize();
    var light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(-4, -4, -12).normalize();
    scene.add(light);
    return scene;
}

var _populateSimpleScene = function (scene, coords){

    let group = new THREE.Group();
    for (var i = 0; i < coords.length; i++) {
        let co = coords[i];
        let geometry = new THREE.CubeGeometry(1, 1, 1);
        // let blockMesh = new THREE.Mesh(geometry, material);
        let blockMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
        blockMesh.position.x = co[0];
        blockMesh.position.y = co[1];
        blockMesh.position.z = co[2];
        blockMesh.coords = co;
        group.add(blockMesh);
    }

    scene.add(group);

    return scene;
}

var _getCamera = function () {
    const fov = 45;
    const aspect = WIDTH / HEIGHT;
    const near = 1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // const camera = new THREE.OrthographicCamera(-5, 5, -5, 5, -100, 100)
    camera.position.set(4, 4, 12)
    // camera.rotation.y=10/180 * Math.PI;
    // camera.lookAt(new THREE.Vector3(5, 5, 0));
    // controls.target = (new THREE.Vector3(5, 5, 0));
    return camera;
}

var _getRaycaster = function() {
    return new THREE.Raycaster();
}

var _getControls = function(camera, domElement) {
    return new OrbitControls(camera, domElement);
}

var makeCanvas = function (width, height, attach) {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    if (attach) {
        document.body.appendChild(canvas);
    }
    return canvas;
}

var addDisplay = function (entity) {
    var className = entity.constructor.name;
    var displayConstructor = display[className];
    if (displayConstructor == undefined) { return undefined; }
    else { return new displayConstructor(entity); }
}

var tryAttachDisplay = function (entity) { 
    if (entity.display != undefined) { return; }
    else {
        var display = addDisplay(entity);
        entity.display = display;
    }
}

function onWindowResize() {
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
}
function onDocumentMouseMove(event) {
    event.preventDefault();
    var rect = event.target.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / WIDTH) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / HEIGHT) * 2 + 1;
}
function onDocumentMouseClick(event) {
    event.preventDefault();
}

var glanimate = function() {
    requestAnimationFrame(glanimate);
    render();
}

function mouseRaycast(mouse, camera, scene) {
    // find intersections
    raycaster.setFromCamera(mouse, camera);
    var group = utilities.getGroup(scene)
    var intersects = raycaster.intersectObjects(group.children);
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            // if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = intersects[0].object;
            // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        }
        // color = 0x00ff00;
        // INTERSECTED.material.emissive.setHex(color);
    } else {
        // if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        // INTERSECTED = null;
    }
    return INTERSECTED;
}

function render() {
    // camera.lookAt(scene.position);
    // controls.target = (new THREE.Vector3(4, 4, 0));
    // controls.target = scene.position;
    camera.updateMatrixWorld();
    
    mouseRaycast(mouse, camera, scene);

    controls.update();
    renderer.render(scene, camera);
}


var glinit = function (canvas) {
    // Rendering Canvas
    renderCanvas = canvas
    renderContext = renderCanvas.getContext("webgl");

    // Camera and Scene
    camera = _getCamera();
    scene = _getScene();
    scene = _populateSimpleScene(scene, _getCoords());
    raycaster = _getRaycaster();
    renderer = new THREE.WebGLRenderer({ canvas: renderCanvas});
    controls = _getControls(camera, renderer.domElement);
    controls.target = (new THREE.Vector3(4, 4, 0));
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    renderContext.scene = scene;
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('click', onDocumentMouseClick, false); 
    // context.canvas.onmousemove = (event) => onDocumentMouseMove(event);
    // context.canvas.onclick = (event) => onDocumentMouseClick(event);
    window.addEventListener('resize', onWindowResize, false);
}

var rebuild_scene = function(renderContext){
    scene = renderContext.scene;
    utilities.clear(renderContext);
    scene = _populateSimpleScene(scene, _getCoords());
    renderContext.scene = scene;
}

var redraw = function (context, state, triggerList, size) {
    let space = state.space;
    let stack = state.stack;
    let k = space.k;
    const canvas = context.canvas;

    // TODO: Change from clear to "update"
    utilities.clear(context); // Reset context

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
    showSpace(space);
    showInputStack(stack);
}


var addListeners = function (context, triggerList) { // Add Listeners
    context.canvas.onmousemove = function (event) {
        // console.log(INTERSECTED);
        event.obj = INTERSECTED.obj;
        triggerList.forEach(t => t(event));
    }
    context.canvas.onclick = function (event) {
        console.log("Interesected", INTERSECTED, INTERSECTED.obj);
        event.obj = INTERSECTED.obj;
        triggerList.forEach(t => t(event));
    }
}


// Very detached from draw/display. Fits Controller.
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

// Very detacted from draw/display. Fits Controller.
var execute = function (effects, space) { // Clarify as "requestExecution"
    var effectToPromise = function (effect) { // TODO: This is incomprehensible
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


module.exports = {
    redraw: redraw,
    addListeners: addListeners,
    checkConfirmation: checkConfirmation,
    makeCanvas: makeCanvas,
    glinit: glinit, // TODO: Remove
    glanimate: glanimate, //TODO: Remove
}