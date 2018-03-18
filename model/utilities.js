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