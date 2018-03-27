var test = require('tape');
utilities = require("../view/utilities");
lerp = utilities.lerp;

test('lerp', function (t) {
    t.plan(5);
    mylerp = lerp(1, 0, 2);

    // setInterval(()=>console.log(mylerp.next()), 300);

    setTimeout(
        () => t.ok(
            Math.abs(mylerp.next().value - 0) < 0.1, 
            'after 0 seconds, lerp = 0'), 
        0);
    setTimeout(
        () => t.ok(
            Math.abs(mylerp.next().value - 1) < 0.1,
            'after 1 seconds, lerp = 1'),
        990);
    setTimeout(
        () => t.ok(
            Math.abs(mylerp.next().value - 2) < 0.1,
            'after 2 seconds, lerp = 2'),
        1990);
    setTimeout(
        () => t.ok(
            Math.abs(mylerp.next().value - 2) < 0.1,
            'after 3 seconds, lerp = 2'),
        3000);
    setTimeout(
        () => t.ok(
            mylerp.next().value == undefined,
            'after 4 seconds, lerp = undefined'),
        4000);
});