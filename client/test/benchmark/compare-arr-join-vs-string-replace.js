const Benchmark = require("./benchmark");

let hintsMap = new Map([
    [1, true],
    [2, true],
    [3, true],
    [4, true],
    [5, true],
    [6, true],
    [7, true],
    [8, true],
    [9, true],
]);
function arrayJoin() {
    hintsMap.delete(3);
}

function strReplace() {
    let hints = "123456789";
    hints = hints.substr(0, 3) + "0" + hints.substr(4);
    return hints;
}

let benchmark = new Benchmark();
benchmark.compare(arrayJoin, strReplace);
