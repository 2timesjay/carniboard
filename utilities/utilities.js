function argmin(arr) {
    let min = Math.min(...arr);
    return arr.indexOf(min);
}

Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

intersection = (set1, set2) => new Set([...set1].filter(num => set2.has(num)))

difference = (set1, set2) => new Set([...set1].filter(num => !set2.has(num)))

union = (set1, set2) => new Set([...set1, ...set2])

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

module.exports = {
    intersection: intersection
}