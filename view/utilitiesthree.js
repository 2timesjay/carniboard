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
    group = objects[objects.length - 1]
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
    clearThree(group);
}

function getMousePos(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
}

function makeRect(x, y, context, size, clr, lfa) {  // Make cuboid
    const lfa = lfa == undefined ? 1.0 : lfa; // Alpha not yet used.
    const clr = clr == undefined ? "#000000" : clr; 

    let geometry = new THREE.CubeGeometry(size,size, size);
    // let blockMesh = new THREE.Mesh(geometry, material);
    let blockMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: clr }));
    blockMesh.position.x = x;
    blockMesh.position.y = y;
    blockMesh.position.z = 0;
    blockMesh.coords = co;
    scene.add(blockMesh);
}

function makeCircle(x, y, context, size, clr, lfa) {
    const alpha = lfa == undefined ? 1.0 : lfa;
    const color = clr == undefined ? "#000000" : clr;
    var centerX = x;
    var centerY = y;
    var radius = size;

    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 5;
    // context.strokeStyle = color;
    // context.stroke();
    context.globalAlpha = 1.0;
}

module.exports = {
    lerp: lerp,
    getMousePos: getMousePos,
    makeRect: makeRect,
    makeCircle: makeCircle,
    clear: clear,
    getGroup: getGroup,
}