var test = require('tape');
utilities = require("../view/utilities");
lerp = utilities.lerp;

test('lerp', function (t) {
    t.plan(5);
    mylerp = lerp(1, 0, 2);

    // setInterval(()=>console.log(mylerp.next()), 300);

    precision = 0.2
    setTimeout(
        () => t.ok(
            Math.abs(mylerp.next().value - 0) < precision, 
            'after 0 seconds, lerp = 0'), 
        0);
    setTimeout(
        () => t.ok(
            Math.abs(mylerp.next().value - 1) < precision,
            'after 1 seconds, lerp = 1'),
        990);
    setTimeout(
        () => t.ok(
            Math.abs(mylerp.next().value - 2) < precision,
            'after 2 seconds, lerp = 2'),
        1980);
    setTimeout(
        () => t.ok(
            Math.abs(mylerp.next().value - 2) < precision,
            'after 3 seconds, lerp = 2'),
        3000);
    setTimeout(
        () => t.ok(
            mylerp.next().value == undefined,
            'after 4 seconds, lerp = undefined'),
        4000);
});