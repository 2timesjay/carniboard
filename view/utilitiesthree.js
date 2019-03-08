
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

function getMousePos(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    var rect = mouseEvent.target.getBoundingClientRect();
    return {
        x: ((mouseEvent.clientX - rect.left) / WIDTH) * 2 - 1,
        y: - ((mouseEvent.clientY - rect.top) / HEIGHT) * 2 + 1
    };
}

function makeRect(co, context, size, clr, lfa) {  // Make cuboid
    const alpha = lfa == undefined ? 1.0 : lfa; // Alpha not yet used.
    const color = clr == undefined ? "#000000" : clr; 

    let geometry = new THREE.CubeGeometry(size,size, size);
    // let blockMesh = new THREE.Mesh(geometry, material);
    let blockMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: clr }));
    blockMesh.position.x = co[0];
    blockMesh.position.y = co[1];
    blockMesh.position.z = co[2];
    blockMesh.coords = co;
    getGroup(context.scene).add(blockMesh);
}

function makeCircle(x, y, context, size, clr, lfa) {
    const alpha = lfa == undefined ? 1.0 : lfa; // Alpha not yet used.
    const color = clr == undefined ? "#000000" : clr;

    let geometry = new THREE.CircleGeometry(size/2.0, 32);
    let circleMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: clr }));
    circleMesh.position.x = co[0];
    circleMesh.position.y = co[1];
    circleMesh.position.z = co[2];
    circleMesh.coords = co;
    getGroup(context.scene).add(circleMesh);
}

var loader = new THREE.FontLoader();

function makeText(co, context, size, clr, lfa) {
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {

        var geometry = new THREE.TextGeometry('Hello three.js!', {
            font: font,
            size: size,
            height: 1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelSegments: 5
        });
    });
}

module.exports = {
    lerp: lerp,
    getMousePos: getMousePos,
    makeRect: makeRect,
    makeCircle: makeCircle,
    clear: clear,
    getGroup: getGroup,
}