
var WIDTH = 800, HEIGHT = 800;

var lerp = function*(rate, current, target, minTime) {
    /* linearly interpolate value from a to b over time t */
    let startTime = new Date().getTime();
    let initialTime = startTime;
    while (Math.abs(target - current) > rate / 100) {
        let diff = target - current;
        let curTime = new Date().getTime();
        let deltaTime = curTime - startTime;
        startTime = curTime;
        let delta = Math.min(rate * deltaTime / 1000, Math.abs(diff)) * Math.sign(diff);
        current += delta;
        yield current;
    }
    while (new Date().getTime() - initialTime < minTime) {
        yield target;
    }
}

var animate = function(effects) {
    moves = effects.filter(e => e.constructor.name == "MoveEffect");
    dests = moves.map(move => move.destination);
    origins = [moves[0].unit.location] + dests.slice(0, dests.length - 1);
    zipped = origins.map((v, i) => ({ o: v, d: dests[i] }));
    let rate = 100;
    return chain(...zipped.map(z => lerp(rate, z.o, z.d)));
}

var chain = function*(...gens) {
    for (let g of gens) {
        yield *g;
    }
}

function getGroup(scene) {
    objects = scene.children
    if (objects.length === 0) { return null; }
    group = objects[objects.length - 1]
    if (group.type !== "Group") { return null; }
    return group
}

function clear(context){
    function clearThree(obj) {
        while (obj.children.length > 0) {
            clearThree(obj.children[0])
            obj.remove(obj.children[0]);
        }
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) obj.material.dispose()
        if (obj.texture) obj.texture.dispose()
    }

    var group = getGroup(context.scene);
    if (group != null) {clearThree(group);}
}

function getMouseTarget(canvasDom, mouseEvent) {
    return mouseEvent.obj;
}

function makeRect(obj, co, context, size, clr, lfa) {  // Make cuboid

    let geometry = new THREE.CubeGeometry(size,size, size);
    // let blockMesh = new THREE.Mesh(geometry, material);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        color: lr

    }));
    mesh.position.x = co[0];
    mesh.position.y = co[1];
    mesh.position.z = co[2];
    mesh.coords = co;
    mesh.obj = obj;
    getGroup(context.scene).add(mesh);
}

function makeCircle(obj, co, context, size, clr, lfa) {
    const alpha = lfa == undefined ? 1.0 : lfa; // Alpha not yet used.
    const color = clr == undefined ? "#000000" : clr;

    let geometry = new THREE.CircleGeometry(size/2.0, 32);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: clr }));
    mesh.position.x = co[0];
    mesh.position.y = co[1];
    mesh.position.z = co[2];
    mesh.coords = co;
    mesh.obj = obj;
    getGroup(context.scene).add(mesh);
}

function makeTexture() {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", 128);
    canvas.setAttribute("height", 128);
    const context = canvas.getContext("2d");
    context.canvas.value = context;
    context.fillStyle = 'darkslategrey';
    context.fillRect(0, 0, 128, 128);
    return context;
}

function makeText(obj, co, context, text, size, clr, lfa) {
    const alpha = lfa == undefined ? 1.0 : lfa; // Alpha not yet used.
    const color = clr == undefined ? "#000000" : clr;
    let texture = makeTexture();
    texture.fillStyle = color;
    texture.font =  128 + "px consolas";
    texture.fillText(text, 0, 128);
    let geometry = new THREE.PlaneGeometry(size, size);
    textureMaterial = new THREE.MeshBasicMaterial();
    textureMaterial.map = new THREE.CanvasTexture(texture.canvas);
    let mesh = new THREE.Mesh(geometry, textureMaterial);
    mesh.position.x = co[0];
    mesh.position.y = co[1];
    mesh.position.z = co[2];
    mesh.coords = co;
    mesh.obj = obj;
    getGroup(context.scene).add(mesh);
}

module.exports = {
    lerp: lerp,
    getMouseTarget: getMouseTarget,
    makeRect: makeRect,
    makeCircle: makeCircle,
    makeText: makeText,
    clear: clear,
    getGroup: getGroup,
}